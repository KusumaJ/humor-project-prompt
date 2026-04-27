import { createClient } from '@/utils/supabase/server';
import { LlmModel, LlmInputType, LlmOutputType, HumorFlavorStepType } from '@/types';

export async function getLlmModels(): Promise<LlmModel[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('llm_models')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching LLM models:', error);
    throw new Error(error.message);
  }
  return data || [];
}

export async function getLlmInputTypes(): Promise<LlmInputType[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('llm_input_types')
    .select('*')
    .order('slug', { ascending: true });

  if (error) {
    console.error('Error fetching LLM input types:', error);
    throw new Error(error.message);
  }
  return data || [];
}

export async function getLlmOutputTypes(): Promise<LlmOutputType[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('llm_output_types')
    .select('*')
    .order('slug', { ascending: true });

  if (error) {
    console.error('Error fetching LLM output types:', error);
    throw new Error(error.message);
  }
  return data || [];
}

export async function getHumorFlavorStepTypes(): Promise<HumorFlavorStepType[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('humor_flavor_step_types')
    .select('*')
    .order('slug', { ascending: true });

  if (error) {
    console.error('Error fetching humor flavor step types:', error);
    throw new Error(error.message);
  }
  return data || [];
}
