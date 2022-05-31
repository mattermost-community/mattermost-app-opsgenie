import {AppBinding} from '../types';
import {
    AppExpandLevels,
    OpsGenieIcon,
    Routes,
    Commands,
    AppFieldTypes,
    options_alert_priority,
    option_alert_priority_p3, AlertCreateForm, NoteCreateForm
} from '../constant';

export const getHelpBinding = (): any => {
    return {
        label: Commands.HELP,
        icon: OpsGenieIcon,
        description: 'Show OpsGenie Help',
        form: {
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathHelp,
                expand: {}
            }
        }
    };
};

export const getConfigureBinding = (): any => {
    return {
        icon: OpsGenieIcon,
        label: Commands.CONFIGURE,
        description: 'Setup OpsGenie Admin Account',
        form: {
            title: "Setup OpsGenie",
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathConfigForm,
                expand: {
                    acting_user: AppExpandLevels.EXPAND_SUMMARY,
                    acting_user_access_token: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
                }
            }
        }
    }
};

export const createAlertBinding = (): AppBinding => {
    return {
        label: Commands.ALERT,
        icon: OpsGenieIcon,
        description: 'Create Alert in OpsGenie',
        form: {
            title: "Create alert",
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathAlertCreate,
                expand: { }
            },
            fields: [
                {
                    modal_label: 'Alert message',
                    name: AlertCreateForm.ALERT_MESSAGE,
                    subtype: 'textarea',
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 1,
                    max_length: 130
                },
                {
                    modal_label: 'Priority',
                    name: AlertCreateForm.ALERT_PRIORITY,
                    type: AppFieldTypes.STATIC_SELECT,
                    is_required: false,
                    position: 2,
                    options: options_alert_priority,
                    value: options_alert_priority.find(value => value.value === option_alert_priority_p3)
                },
            ]
        }
    }
}

export const addNoteToAlertBinding = (): AppBinding => {
    return {
        label: Commands.NOTE,
        icon: OpsGenieIcon,
        description: 'Add note to Alert in OpsGenie',
        form: {
            title: "Add Note To Alert",
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathNoteToAlertModal,
                expand: { }
            },
            fields: [
                {
                    modal_label: 'Note message',
                    name: NoteCreateForm.NOTE_MESSAGE,
                    subtype: 'textarea',
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 1,
                    max_length: 25000
                },
                {
                    modal_label: 'Tiny ID',
                    name: NoteCreateForm.NOTE_TINY_ID,
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 2,
                },
            ]
        }
    }
}

export const getAllTeamsBinding = (): any => {
    const commands: string[] = [
        Commands.TEAM
    ];

    return {
        icon: OpsGenieIcon,
        label: Commands.LIST,
        description: 'Show info of OpsGenie',
        hint: `[${commands.join(' | ')}]`,
        bindings: [
            {
                icon: OpsGenieIcon,
                label: Commands.TEAM,
                description: 'List teams',
                form: {
                    title: "",
                    icon: OpsGenieIcon,
                    submit: {
                        path: Routes.App.CallPathTeamsListSubmit,
                        expand: { }
                    }
                }
            }
        ]
    }
};

