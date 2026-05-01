'use client';

import React from 'react';

interface DuplicateFlavorButtonProps {
    flavorId: string;
    flavorSlug: string;
    action: (formData: FormData) => Promise<string | undefined>;
}

export function DuplicateFlavorButton({ flavorId, flavorSlug, action }: DuplicateFlavorButtonProps) {
    const handleAction = async (formData: FormData) => {
        if (window.confirm(`Are you sure you want to duplicate the humor flavor "${flavorSlug}"? This will also copy all of its steps.`)) {
            const result = await action(formData);
            if (result) {
                alert(result);
            }
        }
    };

    return (
        <form action={handleAction}>
            <input type="hidden" name="flavorId" value={flavorId} />
            <button
                type="submit"
                className="text-orange-600 hover:text-orange-900 text-sm font-medium"
            >
                Duplicate
            </button>
        </form>
    );
}
