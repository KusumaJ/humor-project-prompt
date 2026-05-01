'use server';

import { createHumorFlavor, updateHumorFlavor, deleteHumorFlavor, duplicateHumorFlavor } from './flavorActions';
import { redirect } from 'next/navigation';

export async function createFlavorAction(prevState: any, formData: FormData) {
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const is_pinned = formData.get('is_pinned') === 'on';

    try {
        await createHumorFlavor({ slug, description, is_pinned });
    } catch (error: any) {
        return { error: error.message };
    }

    redirect('/prompt-chain-tool');
}

export async function updateFlavorAction(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const is_pinned = formData.get('is_pinned') === 'on';

    try {
        await updateHumorFlavor(id, { slug, description, is_pinned });
    } catch (error: any) {
        return { error: error.message };
    }

    redirect('/prompt-chain-tool');
}

export async function deleteFlavorAction(id: string) {
    try {
        await deleteHumorFlavor(id);
    } catch (error: any) {
        throw error;
    }

    redirect('/prompt-chain-tool');
}

export async function handleDuplicateAction(formData: FormData) {
    const flavorId = formData.get('flavorId') as string;
    try {
        const newFlavor = await duplicateHumorFlavor(flavorId);
        redirect(`/prompt-chain-tool/flavor/${newFlavor.id}`);
    } catch (error: any) {
        return `Error duplicating flavor: ${error.message}`;
    }
}
