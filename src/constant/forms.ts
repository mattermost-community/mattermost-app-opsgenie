export const ConfigureForm = {
    API_KEY: 'opsgenie_api_key',
};

export const SettingsForm = {
    ALLOW_USER_MAPPING: 'allow_user_mapping',
};

export const SubscriptionCreateForm = {
    TEAM_NAME: 'team_name',
    CHANNEL_ID: 'channel_id',
};

export const SubscriptionDeleteForm = {
    SUBSCRIPTION_ID: 'subscription_id',
};

export const AlertCreateForm = {
    ALERT_MESSAGE: 'alert_message',
    ALERT_PRIORITY: 'alert_priority',
    TEAM_NAME: 'team_name',
};

export const NoteCreateForm = {
    NOTE_MESSAGE: 'alert_message',
    NOTE_TINY_ID: 'note_tiny_id',
};

export const NoteModalForm = {
    NOTE_MESSAGE: 'alert_message',
};

export const CloseAlertForm = {
    NOTE_TINY_ID: 'note_tiny_id',
};

export const AckAlertForm = {
    NOTE_TINY_ID: 'note_tiny_id',
    TINY_ID: 'tinyId',
};

export const UnackAlertForm = {
    NOTE_TINY_ID: 'note_tiny_id',
};

export const SnoozeAlertForm = {
    NOTE_TINY_ID: 'note_tiny_id',
    TIME_AMOUNT: 'time_amount',
};

export const AssignAlertForm = {
    NOTE_TINY_ID: 'note_tiny_id',
    USER_ID: 'user_id',
};

export const TakeOwnershipAlertForm = {
    NOTE_TINY_ID: 'note_tiny_id',
};

export const PriorityAlertForm = {
    NOTE_TINY_ID: 'note_tiny_id',
    ALERT_PRIORITY: 'alert_priority',
};
