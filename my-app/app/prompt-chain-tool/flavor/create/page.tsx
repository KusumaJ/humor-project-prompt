import { createHumorFlavor } from '@/lib/flavorActions';
import { redirect } from 'next/navigation';
import { SubmitButton } from '@/components/SubmitButton';

// Server Action
async function createFlavor(formData: FormData) {
    'use server';

    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const is_pinned = formData.get('is_pinned') === 'on';

    try {
        await createHumorFlavor({ slug, description, is_pinned });
    } catch (error) {
        console.error('Error creating humor flavor:', error);
        // In a real app, you might want to return an error state
        // For now, re-throw or handle more gracefully
        throw error;
    }

    redirect('/prompt-chain-tool'); // Redirect back to list after creation
}

export default async function CreateFlavorPage() {
    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Create New Humor Flavor</h2>

            <form action={createFlavor} className="space-y-6">
                {/* Slug */}
                <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slug</label>
                    <input
                        type="text"
                        id="slug"
                        name="slug"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        rows={3}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    ></textarea>
                </div>

                {/* Is Pinned */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="is_pinned"
                        name="is_pinned"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="is_pinned" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Is Pinned
                    </label>
                </div>

                <div className="flex justify-start">
                    <SubmitButton formAction={createFlavor} pendingText="Creating...">Create Humor Flavor</SubmitButton>
                </div>
            </form>
        </div>
    );
}
