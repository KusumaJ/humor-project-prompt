// lib/api.ts

import { createClient as createClientBrowser } from "@/utils/supabase/client";

const API_BASE_URL = "https://api.almostcrackd.ai";

interface Caption {
  id: string;
  content: string;
}

/**
 * Maps technical backend error messages to user-friendly ones.
 */
function getFriendlyErrorMessage(errorData: any, status: number): string {
  const technicalMessage = errorData?.message || errorData?.statusMessage || "";
  
  // Specific pipeline failures
  if (technicalMessage.includes("No output found for step")) {
    return "The AI pipeline failed to complete one of the steps. This usually happens if the prompt was too restrictive or the model timed out. Please try again.";
  }

  if (status === 502 || status === 503) {
    return "The caption server is temporarily overloaded or undergoing maintenance. Please try again in a few seconds.";
  }

  if (status === 504) {
    return "The request timed out. Generating this caption took longer than expected. Please try again.";
  }

  return technicalMessage || `Server returned an error (${status}).`;
}

/**
 * Normalizes various LLM output shapes into a standard Caption array.
 */
function normalizeCaptions(data: any): Caption[] {
  const fallbackId = () => `fallback-${Math.random().toString(36).substr(2, 9)}`;

  if (Array.isArray(data)) {
    return data.map((item) => {
      if (typeof item === 'string') return { id: fallbackId(), content: item };
      if (typeof item === 'object' && item !== null) {
        return {
          id: String(item.id || item.imageId || fallbackId()),
          content: String(item.content || item.text || item.caption || JSON.stringify(item))
        };
      }
      return { id: fallbackId(), content: String(item) };
    });
  }

  if (typeof data === 'object' && data !== null) {
    const content = data.content || data.text || data.caption || (Object.keys(data).length > 0 ? JSON.stringify(data) : null);
    if (content) {
      return [{ id: String(data.id || fallbackId()), content: String(content) }];
    }
  }

  const rawContent = typeof data === 'string' ? data : String(data || "No content returned.");
  return [{ id: 'raw-output', content: rawContent }];
}

/**
 * Attempts to parse JSON, with a fallback to raw text. 
 * Provides human-readable messages for API failures.
 */
async function safeParseResponse(response: Response, defaultErrorMessage: string): Promise<any> {
  const text = await response.text();
  
  if (!response.ok) {
    let errorData: any = null;
    try {
      errorData = JSON.parse(text);
    } catch {
      // Not JSON
    }

    const friendlyMessage = getFriendlyErrorMessage(errorData, response.status);
    throw new Error(friendlyMessage || defaultErrorMessage);
  }

  try {
    const sanitized = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(sanitized);
  } catch {
    return text;
  }
}

async function getAuthToken(): Promise<string> {
  const supabase = createClientBrowser();
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session) throw new Error("User not authenticated.");
  return data.session.access_token;
}

export async function generatePresignedUrl(contentType: string): Promise<{ presignedUrl: string; cdnUrl: string }> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/pipeline/generate-presigned-url`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ contentType }),
  });

  return await safeParseResponse(response, "Failed to prepare upload.");
}

export async function uploadImageBytes(presignedUrl: string, contentType: string, file: Blob): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!response.ok) throw new Error("The image upload was interrupted. Please check your connection.");
}

export async function registerImageUrl(cdnUrl: string, isCommonUse: boolean = false): Promise<{ imageId: string; now: number }> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/pipeline/upload-image-from-url`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse }),
  });

  return await safeParseResponse(response, "Failed to register image.");
}

export async function generateCaptions(imageId: string, humorFlavorId?: string): Promise<Caption[]> {
  const token = await getAuthToken();
  const body: any = { imageId };
  if (humorFlavorId) {
    const numericId = Number(humorFlavorId);
    body.humorFlavorId = isNaN(numericId) ? humorFlavorId : numericId;
  }
  
  const response = await fetch(`${API_BASE_URL}/pipeline/generate-captions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await safeParseResponse(response, "Failed to generate captions.");
  return normalizeCaptions(data);
}

export async function processImageAndGenerateCaptions(
  input: { file?: File; imageUrl?: string }, humorFlavorId?: string,
): Promise<Caption[]> {
  try {
    let imageId: string;
    if (input.file) {
      const { presignedUrl, cdnUrl } = await generatePresignedUrl(input.file.type);
      await uploadImageBytes(presignedUrl, input.file.type, input.file);
      const { imageId: regId } = await registerImageUrl(cdnUrl);
      imageId = regId;
    } else if (input.imageUrl) {
      const { imageId: regId } = await registerImageUrl(input.imageUrl);
      imageId = regId;
    } else {
      throw new Error("No image provided.");
    }

    return await generateCaptions(imageId, humorFlavorId);
  } catch (error: any) {
    console.error("Pipeline Error:", error.message);
    throw error;
  }
}
