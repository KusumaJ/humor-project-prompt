export enum VoteType {
    NONE = 0,
    UPVOTE = 1,
    DOWNVOTE = -1,
}

export interface VotedCaption {
    id: number
    vote_value: number
    created_datetime_utc: string
    captions: {
        id: string
        content: string
        like_count: number
        images: {
            id: string
            url: string
        }
    }
}

export interface SavedCaption {
    id: number
    created_datetime_utc: string
    captions: {
        id: string
        content: string
        like_count: number
        images: {
            id: string
            url: string
        }
    }
}

// Define and export Profile interface based on public.profiles table
export interface Profile {
    username: string;
    is_superadmin: boolean;
    // Add other fields as needed for consistency with schema and usage in app
    // e.g., id, first_name, last_name, email, is_in_study, is_matrix_admin
}

export interface HumorFlavor {
    id: string;
    created_datetime_utc: string;
    modified_datetime_utc: string;
    slug: string;
    description: string;
    created_by_user_id: string;
    modified_by_user_id: string;
    is_pinned: boolean;
}

export interface HumorFlavorStep {
    id: string;
    created_datetime_utc: string;
    modified_datetime_utc: string;
    humor_flavor_id: string; // References HumorFlavor.id
    llm_temperature: number | null;
    order_by: number;
    llm_input_type_id: number;
    llm_output_type_id: number;
    llm_model_id: number;
    humor_flavor_step_type_id: number;
    llm_system_prompt: string | null;
    llm_user_prompt: string | null;
    description?: string | null;
    created_by_user_id: string;
    modified_by_user_id: string;
}

export interface LlmModel {
    id: number;
    name: string;
    llm_provider_id: number;
    provider_model_id: string;
    is_temperature_supported: boolean;
}

export interface LlmInputType {
    id: number;
    description: string;
    slug: string;
}

export interface LlmOutputType {
    id: number;
    description: string;
    slug: string;
}

export interface HumorFlavorStepType {
    id: number;
    slug: string;
    description: string;
}