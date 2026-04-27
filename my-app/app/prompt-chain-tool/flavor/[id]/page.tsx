import { getHumorFlavorById, updateHumorFlavor, deleteHumorFlavor } from '@/lib/flavorActions';
import { notFound, redirect } from 'next/navigation';
import { SubmitButton } from '@/components/SubmitButton';
import { CopyToClipboard } from '@/components/CopyToClipboard';
import Link from 'next/link';

// Server Actions
async function updateFlavor(formData: FormData) {
    'use server';

    const id = formData.get('id') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const is_pinned = formData.get('is_pinned') === 'on';

    try {
        await updateHumorFlavor(id, { slug, description, is_pinned });
    } catch (error) {
        console.error('Error updating humor flavor:', error);
        throw error;
    }

    redirect('/prompt-chain-tool'); // Redirect back to list after update
}

async function deleteFlavorAction(id: string) {
    'use server';

    try {
        await deleteHumorFlavor(id);
    } catch (error) {
        console.error('Error deleting humor flavor:', error);
        throw error;
    }

    redirect('/prompt-chain-tool'); // Redirect back to list after delete
}

export default async function HumorFlavorDetailPage({ params }: { params: { id: string } }) {
    const resolvedParams = await params;

    const humorFlavor = await getHumorFlavorById(resolvedParams.id);

    if (!humorFlavor) {
        notFound();
    }

    // Bind the ID to the delete action
    const boundDeleteFlavorAction = deleteFlavorAction.bind(null, String(humorFlavor.id));

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Edit Humor Flavor: <CopyToClipboard textToCopy={humorFlavor.id}>{humorFlavor.slug}</CopyToClipboard></h2>
                <Link href={`/prompt-chain-tool/flavor/${humorFlavor.id}/steps`}>
                    <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors border border-gray-300 dark:border-gray-600">
                        Manage Steps
                    </button>
                </Link>
            </div>

            <form action={updateFlavor} className="space-y-6">
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
                    <SubmitButton formAction={updateFlavor} pendingText="Updating...">Update Humor Flavor</SubmitButton>
                    <SubmitButton formAction={boundDeleteFlavorAction} pendingText="Deleting..." confirmText={`Are you sure you want to delete the humor flavor "${humorFlavor.slug}"? This action cannot be undone.`} className="bg-red-600 hover:bg-red-700">Delete Humor Flavor</SubmitButton>
                </div>
            </form>
        </div>
    );
}
