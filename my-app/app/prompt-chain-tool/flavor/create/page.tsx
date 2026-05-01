'use client';

import { createFlavorAction } from '@/lib/flavorServerActions';
import { SubmitButton } from '@/components/SubmitButton';
import { useActionState } from 'react';

export default function CreateFlavorPage() {
    const [state, formAction] = useActionState(createFlavorAction, { error: null });

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Create New Humor Flavor</h2>

            {state?.error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {state.error}
                </div>
            )}

            <form action={formAction} className="space-y-6">
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
                    <SubmitButton pendingText="Creating...">Create Humor Flavor</SubmitButton>
                </div>
            </form>
        </div>
    );
}
