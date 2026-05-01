import { createClient } from '@/utils/supabase/server';
import { AdminTable } from '@/components/AdminTable';
import { FilterControls, FilterOption } from '@/components/FilterControls';
import { PaginationControls } from '@/components/PaginationControls';
import Link from 'next/link';
import { handleDuplicateAction } from '@/lib/flavorServerActions';
import { redirect } from 'next/navigation';
import { DuplicateFlavorButton } from '@/components/DuplicateFlavorButton';

const DEFAULT_PAGE_SIZE = 10;

export default async function PromptChainToolHomePage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const supabase = await createClient();

    const resolvedSearchParams = (await searchParams) || {};
    const currentPage = Number(resolvedSearchParams.page) || 1;
    const searchQuery = (resolvedSearchParams.q as string) || '';
    const filterBy = (resolvedSearchParams.filterBy as string) || 'slug'; // Default filter property for humor_flavors
    const pageSize = DEFAULT_PAGE_SIZE;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize - 1;

    // Fetch humor_flavors
    let humorFlavorsQuery = supabase
        .from('humor_flavors')
        .select('id, created_datetime_utc, slug, description, is_pinned', { count: 'exact' });

    if (searchQuery) {
        if (filterBy === 'id') {
            const idNumber = Number(searchQuery);
            if (!isNaN(idNumber)) {
                humorFlavorsQuery = humorFlavorsQuery.eq('id', idNumber);
            }
        } else if (filterBy === 'slug') {
            humorFlavorsQuery = humorFlavorsQuery.ilike('slug', `%${searchQuery}%`);
        } else if (filterBy === 'description') {
            humorFlavorsQuery = humorFlavorsQuery.ilike('description', `%${searchQuery}%`);
        }
    }

    const { data: humorFlavors, error: flavorError, count: totalFlavorCount } = await humorFlavorsQuery.range(start, end);

    if (flavorError) {
        console.error('Error fetching humor flavors:', JSON.stringify(flavorError, null, 2));
        return <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-red-500">Error loading humor flavors.</div>;
    }

    const processedHumorFlavors = humorFlavors?.map((flavor) => ({
        ...flavor,
        display_id: <span title={flavor.id}>{flavor.id}</span>, // Display full ID
        created_at_formatted: new Date(flavor.created_datetime_utc).toLocaleDateString(),
        is_pinned_display: flavor.is_pinned ? '📌' : '',
        actions: (
            <div className="flex space-x-2 items-center">
                <Link
                    href={`/prompt-chain-tool/flavor/${flavor.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                >
                    Edit
                </Link>
                <DuplicateFlavorButton 
                    flavorId={String(flavor.id)} 
                    flavorSlug={flavor.slug} 
                    action={handleDuplicateAction} 
                />
                <Link
                    href={`/prompt-chain-tool/flavor/${flavor.id}/steps`}
                    className="text-blue-600 hover:text-blue-900"
                >
                    Steps
                </Link>
                <Link
                    href={`/prompt-chain-tool/flavor/${flavor.id}/test`}
                    className="text-green-600 hover:text-green-900"
                >
                    Test
                </Link>
                <Link
                    href={`/prompt-chain-tool/flavor/${flavor.id}/captions`}
                    className="text-purple-600 hover:text-purple-900"
                >
                    View Captions
                </Link>
            </div>
        ),
    })) || [];

    const humorFlavorHeaders = [
        { key: 'display_id', label: 'ID' }, // Use display_id for rendering
        { key: 'is_pinned_display', label: 'Pinned' },
        { key: 'created_at_formatted', label: 'Created' },
        { key: 'slug', label: 'Slug' },
        { key: 'description', label: 'Description' },
        { key: 'actions', label: 'Actions' },
    ];

    const humorFlavorFilterOptions: FilterOption[] = [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'slug', label: 'Slug', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Humor Flavors Management</h2>
                <Link href="/prompt-chain-tool/flavor/create">
                    <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors border border-gray-300 dark:border-gray-600">
                        Create New Humor Flavor
                    </button>
                </Link>
            </div>
            <FilterControls filterOptions={humorFlavorFilterOptions} defaultFilterKey="slug" placeholder="Search humor flavors..." />
            <div className="my-8"></div>
            <AdminTable
                headers={humorFlavorHeaders}
                data={processedHumorFlavors}
                cardTitleKey="slug"
            />
            <PaginationControls
                currentPage={currentPage}
                pageSize={pageSize}
                totalCount={totalFlavorCount || 0}
            />
        </div>
    );
}
