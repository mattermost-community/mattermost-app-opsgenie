import { AppBinding } from './apps';

export type UserNotifyProps = {
    channel: string;
    comments: string;
    desktop: string;
    desktop_sound: string;
    desktop_threads: string;
    email: string;
    email_thread: string;
    first_name: string;
    mention_keys: string;
    push: string;
    push_status: string;
    push_threads: string;
}

export type UserTimezone = {
    useAutomaticTimezone: boolean | string;
    automaticTimezone: string;
    manualTimezone: string;
};

export type UserProfile = {
    id: string;
    create_at: number;
    update_at: number;
    delete_at: number;
    username: string;
    auth_data: string;
    auth_service: string;
    email: string;
    nickname: string;
    first_name: string;
    last_name: string;
    position: string;
    roles: string;
    allow_marketing: boolean;
    notify_props: UserNotifyProps;
    last_password_update: number;
    locale: string;
    timezone?: UserTimezone;
}

export type BindingOptions = {
    isSystemAdmin: boolean,
    isConfigured: boolean,
    isConnected: boolean
    opsGenieUserRole: any,
    mattermostSiteUrl: string
}

export type User = {
    id: string;
    create_at: number;
    update_at: number;
    delete_at: number;
    username: string;
    auth_data: string;
    auth_service: string;
    email: string;
    nickname: string;
    first_name: string;
    last_name: string;
    position: string;
    roles: string;
    last_picture_update: number;
    locale: string;
    timezone: {
        automaticTimezone: string;
        manualTimezone: string;
        useAutomaticTimezone: string;
    };
    is_bot: boolean;
    bot_description: string;
    disable_welcome_email: false;
};

export type Channel = {
    id: string;
    create_at: number;
    update_at: number;
    delete_at: number;
    team_id: string;
    type: string,
    display_name: string;
    name: string;
    header: string;
    purpose: string;
    last_post_at: number;
    total_msg_count: number;
    extra_update_at: number;
    creator_id: string;
};

export type AttachmentOption = {
    text: string;
    value: string;
};

export type AttachmentAction = {
    id: string;
    name: string;
    type: string;
    style?: string;
    data_source?: string;
    integration: {
        url: string;
        context: any;
        expand?: any;
    };
    expand?: any;
    options?: AttachmentOption[];
}

export type Attachment = {
    text?: string;
    title?: string;
    title_link?: string;
    fields?: {
        short: boolean;
        title: string;
        value: string;
        expand?: any;
    }[];
    actions?: AttachmentAction[]
};

export type PostEmbeddedBindings = {
    location: string,
    label: string,
    bindings?: any,
    submit?: {
        path: string,
        expand: any,
        state: any,
    }
}

export type PostBindings = {
    location: 'embedded' | string,
    app_id?: string;
    description: string,
    bindings: PostEmbeddedBindings[]
}

export type PostCreate = {
    channel_id: string;
    message: string;
    root_id?: string;
    file_ids?: string[];
    props?: {
        attachments?: Attachment[];
        app_bindings?: PostBindings[];
    }
}

export type PostEphemeralCreate = {
    user_id: string;
    post: PostCreate;
}

export type PostResponse = {
    id: string,
    create_at: number,
    update_at: number,
    edit_at: 0,
    delete_at: 0,
    is_pinned: false,
    user_id: string,
    channel_id: string,
    root_id: string,
    original_id: string,
    message: string,
    props?: {
        attachments?: Attachment[];
        app_bindings?: PostBindings[];
    }
}

export type PostUpdate = {
    id: string;
    is_pinned?: boolean;
    message?: string;
    has_reactions?: boolean;
    props?: {
        attachments?: Attachment[];
        app_bindings?: PostBindings[];
    }
}

