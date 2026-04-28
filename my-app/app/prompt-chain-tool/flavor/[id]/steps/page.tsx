import Link from 'next/link';
import { AdminTable } from '@/components/AdminTable';
import { FilterControls, FilterOption } from '@/components/FilterControls';
import { PaginationControls } from '@/components/PaginationControls';
import { getHumorFlavorById, getHumorFlavorStepsByFlavorId, reorderHumorFlavorStep } from '@/lib/flavorActions';
import { notFound, redirect } from 'next/navigation';
import { SubmitButton } from '@/components/SubmitButton';

const DEFAULT_PAGE_SIZE = 10;

// Server Action for reordering
async function handleReorder(formData: FormData) {
    'use server';
    const humorFlavorId = formData.get('humorFlavorId') as string;
    const stepId1 = formData.get('stepId1') as string;
    const order1 = Number(formData.get('order1'));
    const stepId2 = formData.get('stepId2') as string;
    const order2 = Number(formData.get('order2'));

    try {
        await reorderHumorFlavorStep(stepId1, order1, stepId2, order2);
    } catch (error) {
        console.error('Error in handleReorder:', error);
    }
    redirect(`/prompt-chain-tool/flavor/${humorFlavorId}/steps`);
}

export default async function AdminFlavorStepsPage({
    params,
    searchParams,
}: {
    params: { id: string };
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const resolvedParams = await params;
    const humorFlavorId = resolvedParams.id;

    const flavor = await getHumorFlavorById(humorFlavorId);
    if (!flavor) {
        notFound();
    }

    const resolvedSearchParams = (searchParams) || {};
    const currentPage = Number(resolvedSearchParams.page) || 1;
    const searchQuery = (resolvedSearchParams.q as string) || '';
    const filterBy = (resolvedSearchParams.filterBy as string) || 'description';
    const pageSize = DEFAULT_PAGE_SIZE;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize - 1;

    let allHumorFlavorSteps = await getHumorFlavorStepsByFlavorId(humorFlavorId);

    if (searchQuery) {
        allHumorFlavorSteps = allHumorFlavorSteps.filter(step => {
            if (filterBy === 'id') return step.id.includes(searchQuery);
            if (filterBy === 'system_prompt') return step.llm_system_prompt?.toLowerCase().includes(searchQuery.toLowerCase());
            if (filterBy === 'user_prompt') return step.llm_user_prompt?.toLowerCase().includes(searchQuery.toLowerCase());
            if (filterBy === 'model') return step.model_name?.toLowerCase().includes(searchQuery.toLowerCase());
            return true;
        });
    }

    const totalFlavorStepCount = allHumorFlavorSteps.length;
    const humorFlavorSteps = allHumorFlavorSteps.slice(start, end + 1);

    const processedHumorFlavorSteps = humorFlavorSteps?.map((step, index) => {
        const prevStep = index > 0 ? humorFlavorSteps[index - 1] : null;
        const nextStep = index < humorFlavorSteps.length - 1 ? humorFlavorSteps[index + 1] : null;

        return {
            ...step,
            display_id: <span title={step.id}>{step.id.substring(0, 8)}...</span>,
            created_at_formatted: new Date(step.created_datetime_utc).toLocaleDateString(),
            modified_at_formatted: new Date(step.modified_datetime_utc).toLocaleDateString(),
            display_temp: step.llm_temperature,
            display_system_prompt: <div className="max-w-xs truncate" title={step.llm_system_prompt}>{step.llm_system_prompt}</div>,
            display_user_prompt: <div className="max-w-xs truncate" title={step.llm_user_prompt}>{step.llm_user_prompt}</div>,
            display_model: step.model_name,
            display_step_type: step.step_type_slug,
            order_by: step.order_by,
            actions: (
                <div className="flex space-x-2 items-center">
                    <Link
                        href={`/prompt-chain-tool/flavor/${humorFlavorId}/steps/${step.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                    >
                        Edit
                    </Link>
                    <div className="flex flex-col space-y-1">
                        {prevStep && (
                            <form action={handleReorder}>
                                <input type="hidden" name="humorFlavorId" value={humorFlavorId} />
                                <input type="hidden" name="stepId1" value={step.id} />
                                <input type="hidden" name="order1" value={step.order_by} />
                                <input type="hidden" name="stepId2" value={prevStep.id} />
                                <input type="hidden" name="order2" value={prevStep.order_by} />
                                <button type="submit" className="text-gray-500 hover:text-gray-700 font-bold" title="Move Up">
                                    ▲
                                </button>
                            </form>
                        )}
                        {nextStep && (
                            <form action={handleReorder}>
                                <input type="hidden" name="humorFlavorId" value={humorFlavorId} />
                                <input type="hidden" name="stepId1" value={step.id} />
                                <input type="hidden" name="order1" value={step.order_by} />
                                <input type="hidden" name="stepId2" value={nextStep.id} />
                                <input type="hidden" name="order2" value={nextStep.order_by} />
                                <button type="submit" className="text-gray-500 hover:text-gray-700 font-bold" title="Move Down">
                                    ▼
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            ),
        };
    }) || [];

    const humorFlavorStepHeaders = [
        { key: 'order_by', label: 'Order' },
        { key: 'display_model', label: 'Model' },
        { key: 'display_temp', label: 'Temp' },
        { key: 'display_step_type', label: 'Step Type' },
        { key: 'display_system_prompt', label: 'System Prompt' },
        { key: 'display_user_prompt', label: 'User Prompt' },
        { key: 'modified_at_formatted', label: 'Modified' },
        { key: 'actions', label: 'Actions' },
    ];

    const humorFlavorStepFilterOptions: FilterOption[] = [
        { key: 'system_prompt', label: 'System Prompt', type: 'text' },
        { key: 'user_prompt', label: 'User Prompt', type: 'text' },
        { key: 'model', label: 'Model Name', type: 'text' },
        { key: 'id', label: 'ID', type: 'text' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Humor Flavor Steps for "{flavor.slug}" ({flavor.id.substring(0, 8)}...)
                </h2>
                <Link href={`/prompt-chain-tool/flavor/${humorFlavorId}/steps/create`}>
                    <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors border border-gray-300 dark:border-gray-600">
                        Create New Step
                    </button>
                </Link>
            </div>

            <FilterControls filterOptions={humorFlavorStepFilterOptions} defaultFilterKey="system_prompt" placeholder="Search humor flavor steps..." />
            <div className="my-8"></div>
            <AdminTable
                headers={humorFlavorStepHeaders}
                data={processedHumorFlavorSteps}
                cardTitleKey="model_name"
            />
            <PaginationControls
                currentPage={currentPage}
                pageSize={pageSize}
                totalCount={totalFlavorStepCount || 0}
            />
        </div>
    );
}