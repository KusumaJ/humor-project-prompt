import { getHumorFlavorById } from '@/lib/flavorActions';
import { notFound } from 'next/navigation';
import { CopyToClipboard } from '@/components/CopyToClipboard';
import Link from 'next/link';
import { FlavorEditForm } from '@/components/FlavorEditForm';

export default async function HumorFlavorDetailPage({ params }: { params: { id: string } }) {
    const resolvedParams = await params;

    const humorFlavor = await getHumorFlavorById(resolvedParams.id);

    if (!humorFlavor) {
        notFound();
    }

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

            <FlavorEditForm humorFlavor={humorFlavor} />
        </div>
    );
}
