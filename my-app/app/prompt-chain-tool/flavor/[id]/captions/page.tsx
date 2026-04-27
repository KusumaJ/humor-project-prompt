import { getHumorFlavorById, getCaptionsByFlavorId } from '@/lib/flavorActions';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export default async function FlavorCaptionsPage({ params }: { params: { id: string } }) {
    const resolvedParams = await params;
    const flavorId = resolvedParams.id;

    const flavor = await getHumorFlavorById(flavorId);
    if (!flavor) {
        notFound();
    }

    const captions = await getCaptionsByFlavorId(flavorId);

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Captions produced by "{flavor.slug}"
            </h2>

            {captions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No captions found for this flavor.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {captions.map((caption: any) => (
                        <div key={caption.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
                            {caption.images?.url && (
                                <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-900">
                                    <Image
                                        src={caption.images.url}
                                        alt={caption.content || 'Caption image'}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            )}
                            <div className="p-4 flex-grow flex flex-col justify-between">
                                <p className="text-gray-800 dark:text-gray-200 italic mb-4">
                                    "{caption.content}"
                                </p>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(caption.created_datetime_utc).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
