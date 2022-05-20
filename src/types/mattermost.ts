export type PostCreate = {
    channel_id: string;
    message: string;
    root_id?: string;
    file_ids?: string[];
    props?: {
        attachments: any[];
    }
}

export type PostUpdate = {
    id: string;
    is_pinned?: boolean;
    message?: string;
    has_reactions?: boolean;
    props?: {
        attachments: any[];
    }
}
