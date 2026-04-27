import { createHumorFlavorStep } from '@/lib/flavorActions';
import { redirect } from 'next/navigation';
import { SubmitButton } from '@/components/SubmitButton';
import { getLlmModels, getLlmInputTypes, getLlmOutputTypes, getHumorFlavorStepTypes } from '@/lib/llmActions';

// Server Action
async function createStep(formData: FormData) {
    'use server';

    const humorFlavorId = formData.get('humor_flavor_id') as string;
    const llm_temperature = formData.get('llm_temperature') ? Number(formData.get('llm_temperature')) : null;
    const order_by = Number(formData.get('order_by'));
    const llm_input_type_id = Number(formData.get('llm_input_type_id'));
    const llm_output_type_id = Number(formData.get('llm_output_type_id'));
    const llm_model_id = Number(formData.get('llm_model_id'));
    const humor_flavor_step_type_id = Number(formData.get('humor_flavor_step_type_id'));
    const llm_system_prompt = formData.get('llm_system_prompt') as string;
    const llm_user_prompt = formData.get('llm_user_prompt') as string;
    const description = formData.get('description') as string;

    try {
        await createHumorFlavorStep({
            humor_flavor_id: humorFlavorId,
            llm_temperature,
            order_by,
            llm_input_type_id,
            llm_output_type_id,
            llm_model_id,
            humor_flavor_step_type_id,
            llm_system_prompt,
            llm_user_prompt,
            description,
        });
    } catch (error) {
        console.error('Error creating humor flavor step:', error);
        throw error;
    }

    redirect(`/prompt-chain-tool/flavor/${humorFlavorId}/steps`); // Redirect back to steps list
}

export default async function CreateHumorFlavorStepPage({ params }: { params: { id: string } }) {
    const resolvedParams = await params;
    const humorFlavorId = resolvedParams.id;

    // Fetch necessary data for dropdowns
    const [llmModels, inputTypes, outputTypes, stepTypes] = await Promise.all([
        getLlmModels(),
        getLlmInputTypes(),
        getLlmOutputTypes(),
        getHumorFlavorStepTypes()
    ]);

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Create New Step for Flavor {humorFlavorId.substring(0, 8)}...</h2>

            <form action={createStep} className="space-y-6">
                <input type="hidden" name="humor_flavor_id" value={humorFlavorId} />
                {/* Order By */}
                <div>
                    <label htmlFor="order_by" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order By</label>
                    <input
                        type="number"
                        id="order_by"
                        name="order_by"
                        required
                        defaultValue={0}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <input
                        type="text"
                        id="description"
                        name="description"
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
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    ></textarea>
                </div>

                <div className="flex justify-start">
                    <SubmitButton type="submit" pendingText="Creating...">Create Humor Flavor Step</SubmitButton>
                </div>
            </form>
        </div>
    );
}