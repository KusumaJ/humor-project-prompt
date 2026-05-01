import { createClient } from '@/utils/supabase/server';
import { HumorFlavor, HumorFlavorStep } from '@/types';

export async function createHumorFlavor(flavor: Omit<HumorFlavor, 'id' | 'created_datetime_utc' | 'modified_datetime_utc' | 'created_by_user_id' | 'modified_by_user_id'>): Promise<HumorFlavor> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('humor_flavors')
    .insert({
      slug: flavor.slug,
      description: flavor.description,
      is_pinned: flavor.is_pinned || false,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error(`A flavor with the slug "${flavor.slug}" already exists. Please use a unique slug.`);
    }
    console.error('Error creating humor flavor:', error);
    throw new Error(error.message);
  }
  return { ...data, id: String(data.id) };
}

export async function getHumorFlavorById(id: string): Promise<HumorFlavor | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('humor_flavors')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows found
      return null;
    }
    console.error('Error fetching humor flavor by ID:', error);
    throw new Error(error.message);
  }
  return { ...data, id: String(data.id) };
}

export async function updateHumorFlavor(id: string, updates: Partial<Omit<HumorFlavor, 'id' | 'created_datetime_utc' | 'created_by_user_id' | 'modified_by_user_id'>>): Promise<HumorFlavor> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('humor_flavors')
    .update({
      ...updates,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error(`A flavor with the slug "${updates.slug}" already exists. Please use a unique slug.`);
    }
    console.error('Error updating humor flavor:', error);
    throw new Error(error.message);
  }
  return { ...data, id: String(data.id) };
}

export async function deleteHumorFlavor(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('humor_flavors')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting humor flavor:', error);
    throw new Error(error.message);
  }
}

// --- Humor Flavor Step CRUD Operations (using Supabase) ---

export async function createHumorFlavorStep(step: Omit<HumorFlavorStep, 'id' | 'created_datetime_utc' | 'modified_datetime_utc' | 'created_by_user_id' | 'modified_by_user_id'>): Promise<HumorFlavorStep> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('humor_flavor_steps')
    .insert({
      humor_flavor_id: Number(step.humor_flavor_id), // Convert to number for bigint
      llm_temperature: step.llm_temperature,
      order_by: step.order_by,
      llm_input_type_id: step.llm_input_type_id,
      llm_output_type_id: step.llm_output_type_id,
      llm_model_id: step.llm_model_id,
      humor_flavor_step_type_id: step.humor_flavor_step_type_id,
      llm_system_prompt: step.llm_system_prompt,
      llm_user_prompt: step.llm_user_prompt,
      description: step.description ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating humor flavor step:', error);
    throw new Error(error.message);
  }
  return { ...data, id: String(data.id), humor_flavor_id: String(data.humor_flavor_id) }; // Convert IDs back to string
}

export async function getHumorFlavorStepsByFlavorId(flavorId: string): Promise<any[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('humor_flavor_steps')
        .select(`
            *,
            llm_models (name),
            llm_input_types (slug),
            llm_output_types (slug),
            humor_flavor_step_types (slug)
        `)
        .eq('humor_flavor_id', Number(flavorId)) // Convert to number for bigint
        .order('order_by', { ascending: true });

    if (error) {
        console.error('Error fetching humor flavor steps by flavor ID:', error);
        throw new Error(error.message);
    }
    // Safely map and convert IDs to string
    return data ? data.map(step => ({
        ...step,
        id: String(step.id),
        humor_flavor_id: String(step.humor_flavor_id),
        llm_temperature: step.llm_temperature !== null ? Number(step.llm_temperature) : null, // Ensure numeric for API
        model_name: step.llm_models?.name,
        input_type_slug: step.llm_input_types?.slug,
        output_type_slug: step.llm_output_types?.slug,
        step_type_slug: step.humor_flavor_step_types?.slug
    })) : [];
}

export async function getHumorFlavorStepById(stepId: string): Promise<HumorFlavorStep | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('humor_flavor_steps')
    .select('*')
    .eq('id', Number(stepId)) // Convert to number for bigint
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows found
      return null;
    }
    console.error('Error fetching humor flavor step by ID:', error);
    throw new Error(error.message);
  }
  return {
      ...data,
      id: String(data.id),
      humor_flavor_id: String(data.humor_flavor_id),
      llm_temperature: data.llm_temperature !== null ? Number(data.llm_temperature) : null,
  };
}

export async function updateHumorFlavorStep(stepId: string, updates: Partial<Omit<HumorFlavorStep, 'id' | 'created_datetime_utc' | 'humor_flavor_id' | 'created_by_user_id' | 'modified_by_user_id'>>): Promise<HumorFlavorStep> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('humor_flavor_steps')
    .update({
      ...updates,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq('id', Number(stepId)) // Convert to number for bigint
    .select()
    .single();

  if (error) {
    console.error('Error updating humor flavor step:', error);
    throw new Error(error.message);
  }
  return {
      ...data,
      id: String(data.id),
      humor_flavor_id: String(data.humor_flavor_id),
      llm_temperature: data.llm_temperature !== null ? Number(data.llm_temperature) : null,
  };
}

export async function deleteHumorFlavorStep(stepId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('humor_flavor_steps')
    .delete()
    .eq('id', Number(stepId)); // Convert to number for bigint

  if (error) {
    console.error('Error deleting humor flavor step:', error);
    throw new Error(error.message);
  }
}

export async function reorderHumorFlavorStep(stepId1: string, order1: number, stepId2: string, order2: number): Promise<void> {
    const supabase = await createClient();

    // Perform two updates in a transaction-like way (Supabase doesn't have multi-table transactions in simple JS client, but we can do it sequentially)
    const { error: error1 } = await supabase
        .from('humor_flavor_steps')
        .update({ order_by: order2, modified_datetime_utc: new Date().toISOString() })
        .eq('id', Number(stepId1));

    if (error1) {
        console.error('Error reordering step 1:', error1);
        throw new Error(error1.message);
    }

    const { error: error2 } = await supabase
        .from('humor_flavor_steps')
        .update({ order_by: order1, modified_datetime_utc: new Date().toISOString() })
        .eq('id', Number(stepId2));

    if (error2) {
        console.error('Error reordering step 2:', error2);
        throw new Error(error2.message);
    }
}

export async function getCaptionsByFlavorId(flavorId: string, limit: number = 100) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('captions')
        .select(`
            id,
            content,
            created_datetime_utc,
            images (
                url
            )
        `)
        .eq('humor_flavor_id', Number(flavorId))
        .order('created_datetime_utc', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching captions by flavor ID:', error);
        throw new Error(error.message);
    }

    return data || [];
}

export async function duplicateHumorFlavor(id: string): Promise<HumorFlavor> {
    const supabase = await createClient();

    // 1. Fetch original flavor
    const originalFlavor = await getHumorFlavorById(id);
    if (!originalFlavor) throw new Error('Original flavor not found');

    // 2. Create new flavor with unique slug
    const timestamp = new Date().getTime();
    const newSlug = `${originalFlavor.slug}-copy-${timestamp}`;
    
    const newFlavor = await createHumorFlavor({
        slug: newSlug,
        description: `Copy of ${originalFlavor.slug}: ${originalFlavor.description}`,
        is_pinned: false,
    });

    // 3. Fetch original steps
    const originalSteps = await getHumorFlavorStepsByFlavorId(id);

    // 4. Duplicate each step
    for (const step of originalSteps) {
        await createHumorFlavorStep({
            humor_flavor_id: newFlavor.id,
            llm_temperature: step.llm_temperature,
            order_by: step.order_by,
            llm_input_type_id: step.llm_input_type_id,
            llm_output_type_id: step.llm_output_type_id,
            llm_model_id: step.llm_model_id,
            humor_flavor_step_type_id: step.humor_flavor_step_type_id,
            llm_system_prompt: step.llm_system_prompt,
            llm_user_prompt: step.llm_user_prompt,
            description: step.description,
        });
    }

    return newFlavor;
}