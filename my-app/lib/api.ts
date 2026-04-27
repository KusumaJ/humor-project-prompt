// lib/api.ts

import { createClient as createClientBrowser } from "@/utils/supabase/client"; // Use browser-side for auth token
// HumorFlavor type is no longer needed here after moving CRUD functions

const API_BASE_URL = "https://api.almostcrackd.ai";

async function getAuthToken(): Promise<string> {
  const supabase = createClientBrowser(); // Use browser client for session
  const { data, error } = await supabase.auth.getSession();

  if (error || !data?.session) {
    throw new Error("User not authenticated.");
  }
  return data.session.access_token;
}

interface PresignedUrlResponse {
  presignedUrl: string;
  cdnUrl: string;
}

export async function generatePresignedUrl(
  contentType: string,
): Promise<PresignedUrlResponse> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/pipeline/generate-presigned-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contentType }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to generate presigned URL.");
  }

  return response.json();
}

export async function uploadImageBytes(
  presignedUrl: string,
  contentType: string,
  file: Blob,
): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image bytes.");
  }
}

interface RegisterImageResponse {
  imageId: string;
  now: number;
}

export async function registerImageUrl(
  cdnUrl: string,
  isCommonUse: boolean = false,
): Promise<RegisterImageResponse> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/pipeline/upload-image-from-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to register image URL.");
  }

  return response.json();
}

export async function generateCaptions(imageId: string, humorFlavorId?: string): Promise<any[]> {
  const token = await getAuthToken();
  const body: { imageId: string; humorFlavorId?: string | number } = { imageId };
  if (humorFlavorId) {
    const numericHumorFlavorId = Number(humorFlavorId);
    if (!isNaN(numericHumorFlavorId)) {
      body.humorFlavorId = numericHumorFlavorId; // Send as number if valid
    } else {
      body.humorFlavorId = humorFlavorId; // Keep as string otherwise
    }
  }
  console.log("Sending generateCaptions request with body:", JSON.stringify(body));

  const response = await fetch(`${API_BASE_URL}/pipeline/generate-captions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to generate captions.");
  }

  return response.json();
}

export async function processImageAndGenerateCaptions(
  input: { file?: File; imageUrl?: string }, humorFlavorId?: string,
): Promise<any[]> {
  try {
    let imageId: string;

    if (input.file) {
      // Process file upload
      const { presignedUrl, cdnUrl } = await generatePresignedUrl(input.file.type);
      console.log("Generated Presigned URL:", presignedUrl);
      console.log("CDN URL:", cdnUrl);

      await uploadImageBytes(presignedUrl, input.file.type, input.file);
      console.log("Image bytes uploaded successfully.");

      const { imageId: registeredImageId } = await registerImageUrl(cdnUrl);
      imageId = registeredImageId;
      console.log("Image registered with ID:", imageId);

    } else if (input.imageUrl) {
      // Process image URL directly
      const { imageId: registeredImageId } = await registerImageUrl(input.imageUrl);
      imageId = registeredImageId;
      console.log("Image registered with ID from URL:", imageId);
    } else {
      throw new Error("No image file or URL provided.");
    }

    // Step 4: Generate captions from the registered image
    const captions = await generateCaptions(imageId, humorFlavorId);
    console.log("Captions generated:", captions);

    return captions;
  } catch (error: any) {
    console.error("Error in image processing pipeline:", error.message);
    throw error;
  }
}
