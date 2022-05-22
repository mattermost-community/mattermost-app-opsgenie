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
    };
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
    }[];
    actions?: AttachmentAction[]
};

export type PostCreate = {
    channel_id: string;
    message: string;
    root_id?: string;
    file_ids?: string[];
    props?: {
        attachments: Attachment[];
    }
}

export type PostUpdate = {
    id: string;
    is_pinned?: boolean;
    message?: string;
    has_reactions?: boolean;
    props?: {
        attachments: Attachment[];
    }
}

export type DialogElementText = {
    display_name: string; // Display name of the field shown to the user in the dialog. Maximum 24 characters.
    name: string; // Name of the field element used by the integration. Maximum 300 characters. You should use unique name fields in the same dialog.
    type: string; // Set this value to text for a text element.
    subtype?: string; // (Optional) One of text, email, number, password (as of v5.14), tel, or url. Default is text. Use this to set which keypad is presented to users on mobile when entering the field.
    min_length?: number; // (Optional) Minimum input length allowed for an element. Default is 0.
    max_length?: number; // (Optional) Maximum input length allowed for an element. Default is 150. If you expect the input to be greater 150 characters, consider using a textarea type element instead.
    optional?: boolean; // (Optional) Set to true if this form element is not required. Default is false.
    help_text?: string; // (Optional) Set help text for this form element. Maximum 150 characters.
    default?: string; // (Optional) Set a default value for this form element. Maximum 150 characters.
    placeholder?: string // (Optional) A string displayed to help guide users in completing the element. Maximum 150 characters.
}

export type DialogElementTextarea = {
    display_name: string; // Display name of the field shown to the user in the dialog. Maximum 24 characters.
    name: string; // Name of the field element used by the integration. Maximum 300 characters. You should use unique name fields in the same dialog.
    type: string; // Set this value to text for a text element.
    subtype?: string; // (Optional) One of text, email, number, password (as of v5.14), tel, or url. Default is text. Use this to set which keypad is presented to users on mobile when entering the field.
    min_length?: number; // (Optional) Minimum input length allowed for an element. Default is 0.
    max_length?: number; // (Optional) Maximum input length allowed for an element. Default is 3000.
    optional?: boolean; // (Optional) Set to true if this form element is not required. Default is false.
    help_text?: string; // (Optional) Set help text for this form element. Maximum 150 characters.
    default?: string; // (Optional) Set a default value for this form element. Maximum 3000 characters.
    placeholder?: string // (Optional) A string displayed to help guide users in completing the element. Maximum 3000 characters.
}

export type DialogElementSelect = {
    display_name: string; // Display name of the field shown to the user in the dialog. Maximum 24 characters.
    name: string; // Name of the field element used by the integration. Maximum 300 characters. You should use unique name fields in the same dialog.
    type: string; // Set this value to select for a select element.
    data_source?: string; // (Optional) One of users, or channels. If none specified, assumes a manual list of options is provided by the integration.
    optional?: boolean; // (Optional) Set to true if this form element is not required. Default is false.
    options?: { // dropdown options
        text: string;
        value: string;
    }[];
    help_text?: any[]; // (Optional) An array of options for the select element. Not applicable for users or channels data sources.
    default?: string; // (Optional) Set a default value for this form element. Maximum 3,000 characters.
    placeholder?: string; // (Optional) A string displayed to help guide users in completing the element. Maximum 150 characters.
}

export type DialogElementCheckbox = {
    display_name: string; // Display name of the field shown to the user in the dialog. Maximum 24 characters.
    name: string; // Name of the field element used by the integration. Maximum 300 characters. You should use unique name fields in the same dialog.
    type: string; // Set this value to bool for a checkbox element.
    optional?: boolean; // (Optional) Set to true if this form element is not required. Default is false.
    help_text?: string; // (Optional) Set help text for this form element. Maximum 150 characters.
    default?: string; // (Optional) Set a default value for this form element. true or false.
    placeholder?: string; // (Optional) A string displayed to include a label besides the checkbox. Maximum 150 characters.
}

export type DialogElementRadio = {
    display_name: string; // Display name of the field shown to the user in the dialog. Maximum 24 characters.
    name: string; // Name of the field element used by the integration. Maximum 300 characters. You should use unique name fields in the same dialog.
    type: string; // Set this value to radio for a radio element.
    options?: any[] // (Optional) An array of options for the radio element.
    help_text?: string; // (Optional) Set help text for this form element. Maximum 150 characters.
    default: string; // (Optional) Set a default value for this form element.
}

export type DialogProps = {
    trigger_id: string;
    url: string;
    dialog: {
        callback_id?: string;
        title: string;
        introduction_text?: string;
        elements: (DialogElementText | DialogElementTextarea | DialogElementSelect | DialogElementCheckbox | DialogElementRadio)[];
        icon_url?: string;
        submit_label?: string;
        notify_on_cancel?: boolean;
        state?: string;
    }
}

