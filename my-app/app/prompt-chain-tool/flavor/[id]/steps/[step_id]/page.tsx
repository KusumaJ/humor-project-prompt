import { getHumorFlavorStepById, updateHumorFlavorStep, deleteHumorFlavorStep, getHumorFlavorById } from '@/lib/flavorActions';
import { redirect, notFound } from 'next/navigation';
import { SubmitButton } from '@/components/SubmitButton';
import { CopyToClipboard } from '@/components/CopyToClipboard';
import { getLlmModels, getLlmInputTypes, getLlmOutputTypes, getHumorFlavorStepTypes } from '@/lib/llmActions';

// Server Actions
async function updateStep(formData: FormData) {
    'use server';

    const humorFlavorId = formData.get('humor_flavor_id') as string;
    const stepId = formData.get('step_id') as string;
    const llm_temperature = formData.get('llm_temperature') ? Number(formData.get('llm_temperature')) : null;
    const order_by = Number(formData.get('order_by'));
    const llm_input_type_id = Number(formData.get('llm_input_type_id'));
    const llm_output_type_id = Number(formData.get('llm_output_type_id'));
    const llm_model_id = Number(formData.get('llm_model_id'));
    const humor_flavor_step_type_id = Number(formData.get('humor_flavor_step_type_id'));
    const llm_system_prompt = formData.get('llm_system_prompt') as string;
    const llm_user_prompt = formData.get('llm_user_prompt') as string;

    try {
        await updateHumorFlavorStep(stepId, {
            llm_temperature,
            order_by,
            llm_input_type_id,
            llm_output_type_id,
            llm_model_id,
            humor_flavor_step_type_id,
            llm_system_prompt,
            llm_user_prompt,
        });
    } catch (error) {
        console.error('Error updating humor flavor step:', error);
        throw error;
    }

    redirect(`/prompt-chain-tool/flavor/${humorFlavorId}/steps`); // Redirect back to steps list
}

async function deleteStepAction(formData: FormData) {
    'use server';

    const humorFlavorId = formData.get('humor_flavor_id') as string;
    const stepId = formData.get('step_id') as string;

    try {
        await deleteHumorFlavorStep(stepId);
    } catch (error) {
        console.error('Error deleting humor flavor step:', error);
        throw error;
    }

    redirect(`/prompt-chain-tool/flavor/${humorFlavorId}/steps`); // Redirect back to steps list
}

export default async function HumorFlavorStepDetailPage({ params }: { params: { id: string, step_id: string } }) {
    const resolvedParams = await params;
    const humorFlavorId = resolvedParams.id;
    const stepId = resolvedParams.step_id;

    const humorFlavor = await getHumorFlavorById(humorFlavorId);
    if (!humorFlavor) {
        notFound();
    }

    const humorFlavorStep = await getHumorFlavorStepById(stepId);
    if (!humorFlavorStep) {
        notFound();
    }

    // Fetch necessary data for dropdowns
    const [llmModels, inputTypes, outputTypes, stepTypes] = await Promise.all([
        getLlmModels(),
        getLlmInputTypes(),
        getLlmOutputTypes(),
        getHumorFlavorStepTypes()
    ]);

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Edit Step for "{humorFlavor.slug}": <CopyToClipboard textToCopy={humorFlavorStep.id}>{humorFlavorStep.order_by}.</CopyToClipboard></h2>

            <div className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                <p>Created: {new Date(humorFlavorStep.created_datetime_utc).toLocaleString()}</p>
                <p>Modified: {new Date(humorFlavorStep.modified_datetime_utc).toLocaleString()}</p>
            </div>

            <form action={updateStep} className="space-y-6">
                <input type="hidden" name="step_id" value={humorFlavorStep.id} />
                <input type="hidden" name="humor_flavor_id" value={humorFlavorId} />

                {/* Order By */}
                <div>
                    <label htmlFor="order_by" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order By</label>
                    <input
                        type="number"
                        id="order_by"
                        name="order_by"
                        required
                        defaultValue={humorFlavorStep.order_by}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* LLM Temperature */}
                <div>
                    <label htmlFor="llm_temperature" className="block text-sm font-medium text-gray-700 dark:text-gray-300">LLM Temperature</label>
                    <input
                        type="number"
                        step="0.01"
                        id="llm_temperature"
                        name="llm_temperature"
                        defaultValue={humorFlavorStep.llm_temperature || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* LLM Input Type ID (Dropdown) */}
                <div>
                    <label htmlFor="llm_input_type_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">LLM Input Type</label>
                    <select
                        id="llm_input_type_id"
                        name="llm_input_type_id"
                        required
                        defaultValue={humorFlavorStep.llm_input_type_id}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                    >
                        {inputTypes.map((type) => (
                            <option key={type.id} value={type.id}>{type.slug}</option>
                        ))}
                    </select>
                </div>

                {/* LLM Output Type ID (Dropdown) */}
                <div>
                    <label htmlFor="llm_output_type_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">LLM Output Type</label>
                    <select
                        id="llm_output_type_id"
                        name="llm_output_type_id"
                        required
                        defaultValue={humorFlavorStep.llm_output_type_id}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                    >
                        {outputTypes.map((type) => (
                            <option key={type.id} value={type.id}>{type.slug}</option>
                        ))}
                    </select>
                </div>

                {/* LLM Model ID (Dropdown) */}
                <div>
                    <label htmlFor="llm_model_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">LLM Model</label>
                    <select
                        id="llm_model_id"
                        name="llm_model_id"
                        required
                        defaultValue={humorFlavorStep.llm_model_id}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                    >
                        {llmModels.map((model) => (
                            <option key={model.id} value={model.id}>{model.name}</option>
                        ))}
                    </select>
                </div>

                {/* Humor Flavor Step Type ID (Dropdown) */}
                <div>
                    <label htmlFor="humor_flavor_step_type_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Humor Flavor Step Type</label>
                    <select
                        id="humor_flavor_step_type_id"
                        name="humor_flavor_step_type_id"
                        required
                        defaultValue={humorFlavorStep.humor_flavor_step_type_id}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                    >
                        {stepTypes.map((type) => (
                            <option key={type.id} value={type.id}>{type.slug}</option>
                        ))}
                    </select>
                </div>

                {/* LLM System Prompt */}
                <div>
                    <label htmlFor="llm_system_prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">LLM System Prompt</label>
                    <textarea
                        id="llm_system_prompt"
                        name="llm_system_prompt"
                        rows={3}
                        defaultValue={humorFlavorStep.llm_system_prompt || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    ></textarea>
                </div>

                {/* LLM User Prompt */}
                <div>
                    <label htmlFor="llm_user_prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">LLM User Prompt</label>
                    <textarea
                        id="llm_user_prompt"
                        name="llm_user_prompt"
                        rows={3}
                        defaultValue={humorFlavorStep.llm_user_prompt || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div className="flex justify-between items-center">
                    <SubmitButton type="submit" pendingText="Updating...">Update Humor Flavor Step</SubmitButton>
                    <SubmitButton formAction={deleteStepAction} pendingText="Deleting..." confirmText={`Are you sure you want to delete this step?`} className="bg-red-600 hover:bg-red-700">Delete Humor Flavor Step</SubmitButton>
                </div>
            </form>
        </div>
    );
}
