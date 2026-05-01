'use client';

import React, { useState } from 'react'; // Explicitly import React
import { processImageAndGenerateCaptions } from '@/lib/api';
import { SubmitButton } from '@/components/SubmitButton';
import { ImageUploader } from '@/components/ImageUploader';
// notFound and getHumorFlavorById are server-side only, they should not be imported into client components
// import { notFound } from 'next/navigation';
// import { getHumorFlavorById } from '@/lib/api'; // Not needed here, flavorId comes from params

interface CaptionResult {
    id: string;
    content: string;
}

export default function TestHumorFlavorPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
    const [captions, setCaptions] = useState<CaptionResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // If params is a Promise, unwrap it using React.use()
    const resolvedParams = params instanceof Promise ? React.use(params) : params;
    const flavorId = resolvedParams.id;

    const handleGenerateCaptions = async (formData: FormData) => {
        setLoading(true);
        setError(null);
        setCaptions([]);

        const imageFile = formData.get('image-file') as File;
        const imageUrl = formData.get('image-url') as string;

        let input: { file?: File; imageUrl?: string };

        if (imageFile && imageFile.size > 0) {
            input = { file: imageFile };
        } else if (imageUrl) {
            input = { imageUrl: imageUrl };
        } else {
            setError("Please upload an image file or provide an image URL.");
            setLoading(false);
            return;
        }

        try {
            const generatedCaptions = await processImageAndGenerateCaptions(input, flavorId);
            setCaptions(generatedCaptions);
        } catch (err: any) {
            console.error("Error generating captions:", err);
            setError(err.message || "Failed to generate captions. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // This component will be rendered as a Client Component, but it should fetch flavor details on the server.
    // For simplicity, we're not fetching flavor details here. In a real app, you might fetch it on the server
    // and pass it as a prop, or fetch it on the client if it's dynamic.

    // Using a regular form submission with a client action is generally for more complex client-side logic.
    // For simpler server actions, the `action` prop on the form is sufficient.
    // Given the image upload, we need client-side state for the image preview, so this is a client component.
    // The server action 'handleGenerateCaptions' would technically be a client action here
    // if it modifies client state directly. Let's adapt it to be called from client.

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Test Humor Flavor: {flavorId.substring(0, 8)}...</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Upload an image to generate captions using this humor flavor.</p>

            <form action={handleGenerateCaptions} className="space-y-6">
                <ImageUploader name="image" />

                <div className="flex justify-start">
                    <SubmitButton type="submit" pendingText="Generating..." disabled={loading}>Generate Captions</SubmitButton>
                </div>
            </form>

            {loading && <p className="mt-4 text-center text-indigo-600 dark:text-indigo-400">Generating captions...</p>}
            {error && <p className="mt-4 text-red-600 dark:text-red-400">Error: {error}</p>}

            {captions.length > 0 && (
                <div className="mt-8 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">
                        Generated Results
                    </h3>
                    <div className="grid gap-4">
                        {captions.map((caption) => (
                            <div 
                                key={caption.id} 
                                className={`p-4 rounded-lg border shadow-sm ${
                                    caption.id === 'raw-output' 
                                        ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' 
                                        : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                                }`}
                            >
                                {caption.id === 'raw-output' && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1 block">
                                        Unstructured Response
                                    </span>
                                )}
                                <p className="text-gray-800 dark:text-gray-200 leading-relaxed italic">
                                    "{caption.content}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
