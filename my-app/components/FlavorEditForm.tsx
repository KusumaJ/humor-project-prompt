'use client';

import { updateFlavorAction, deleteFlavorAction } from '@/lib/flavorServerActions';
import { SubmitButton } from '@/components/SubmitButton';
import { useActionState } from 'react';
import { HumorFlavor } from '@/types';

export function FlavorEditForm({ humorFlavor }: { humorFlavor: HumorFlavor }) {
    const [state, formAction] = useActionState(updateFlavorAction, { error: null });

    return (
        <form action={formAction} className="space-y-6">
            {state?.error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {state.error}
                </div>
            )}
            
            <input type="hidden" name="id" value={humorFlavor.id} />

            {/* Slug */}
            <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slug</label>
                <input
                    type="text"
                    id="slug"
                    name="slug"
                    defaultValue={humorFlavor.slug || ''}
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
                    defaultValue={humorFlavor.description || ''}
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
                    defaultChecked={humorFlavor.is_pinned}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="is_pinned" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Is Pinned
                </label>
            </div>

            <div className="flex justify-between items-center">
                <SubmitButton pendingText="Updating...">Update Humor Flavor</SubmitButton>
                <SubmitButton 
                    type="button"
                    onClick={async () => {
                        if (window.confirm(`Are you sure you want to delete the humor flavor "${humorFlavor.slug}"? This action cannot be undone.`)) {
                            try {
                                await deleteFlavorAction(humorFlavor.id);
                            } catch (error: any) {
                                alert(`Error deleting flavor: ${error.message}`);
                            }
                        }
                    }}
                    pendingText="Deleting..." 
                    className="bg-red-600 hover:bg-red-700"
                >
                    Delete Humor Flavor
                </SubmitButton>
            </div>
        </form>
    );
}
