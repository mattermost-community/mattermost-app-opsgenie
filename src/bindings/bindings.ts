import {AppBinding} from '../types';
import {
    AppExpandLevels,
    OpsGenieIcon,
    Routes,
    Commands,
    AppFieldTypes,
    options_alert_priority,
    option_alert_priority_p3,
    AlertCreateForm,
    NoteCreateForm,
    CloseAlertForm,
    AckAlertForm,
    UnackAlertForm,
    SnoozeAlertForm,
    options_alert_time,
    AssignAlertForm,
    TakeOwnershipAlertForm
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
                    modal_label: 'Team name',
                    name: AlertCreateForm.TEAM_NAME,
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 2,
                    max_length: 100
                },
                {
                    modal_label: 'Priority',
                    name: AlertCreateForm.ALERT_PRIORITY,
                    type: AppFieldTypes.STATIC_SELECT,
                    is_required: false,
                    position: 3,
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
                expand: {
                    acting_user: AppExpandLevels.EXPAND_ALL
                }
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

export const closeAlertBinding = (): AppBinding => {
    return {
        label: Commands.CLOSE,
        icon: OpsGenieIcon,
        description: 'Close Alert in OpsGenie',
        form: {
            title: "Close Alert",
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathAlertClose,
                expand: {
                    acting_user: AppExpandLevels.EXPAND_ALL
                }
            },
            fields: [
                {
                    modal_label: 'Tiny ID',
                    name: CloseAlertForm.NOTE_TINY_ID,
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 1,
                },
            ]
        }
    }
}

export const ackAlertBinding = (): AppBinding => {
    return {
        label: Commands.ACK,
        icon: OpsGenieIcon,
        description: 'Acknowledge alert in OpsGenie',
        form: {
            title: 'Acknowledge the alerts',
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathAlertAcknowledged,
                expand: {
                    acting_user: AppExpandLevels.EXPAND_ALL
                }
            },
            fields: [
                {
                    modal_label: 'Tiny ID',
                    name: AckAlertForm.NOTE_TINY_ID,
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 1,
                },
            ]
        }
    }
}

export const unackAlertBinding = (): AppBinding => {
    return {
        label: Commands.UNACK,
        icon: OpsGenieIcon,
        description: 'UnAcknowledge alert in OpsGenie',
        form: {
            title: 'UnAcknowledge the alerts',
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathAlertUnacknowledge,
                expand: {
                    acting_user: AppExpandLevels.EXPAND_ALL
                }
            },
            fields: [
                {
                    modal_label: 'Tiny ID',
                    name: UnackAlertForm.NOTE_TINY_ID,
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 1,
                },
            ]
        }
    }
}

export const snoozeAlertBinding = (): AppBinding => {
    return {
        label: Commands.SNOOZE,
        icon: OpsGenieIcon,
        description: 'Snooze alert in OpsGenie',
        form: {
            title: 'Snooze the alerts',
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathSnoozeAlert,
                expand: {
                    acting_user: AppExpandLevels.EXPAND_ALL
                }
            },
            fields: [
                {
                    modal_label: 'Tiny ID',
                    name: SnoozeAlertForm.NOTE_TINY_ID,
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 1,
                },
                {
                    modal_label: 'Time Amount',
                    name: SnoozeAlertForm.TIME_AMOUNT,
                    type: AppFieldTypes.STATIC_SELECT,
                    is_required: true,
                    position: 2,
                    options: options_alert_time
                },
            ]
        }
    }
}

export const assignAlertBinding = (): AppBinding => {
    return {
        label: Commands.ASSIGN,
        icon: OpsGenieIcon,
        description: 'Assign alert in OpsGenie',
        form: {
            title: 'Assign the alerts',
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathAssignAlert,
                expand: {
                    acting_user: AppExpandLevels.EXPAND_ALL
                }
            },
            fields: [
                {
                    modal_label: 'Tiny ID',
                    name: AssignAlertForm.NOTE_TINY_ID,
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 1,
                },
                {
                    modal_label: 'User',
                    name: AssignAlertForm.USER_ID,
                    type: AppFieldTypes.USER,
                    is_required: true,
                    position: 2
                },
            ]
        }
    }
}

export const ownAlertBinding = (): AppBinding => {
    return {
        label: Commands.OWN,
        icon: OpsGenieIcon,
        description: 'Take ownership alert in OpsGenie',
        form: {
            title: 'Take ownership of the alerts',
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathTakeOwnershipAlertSubmit,
                expand: {
                    acting_user: AppExpandLevels.EXPAND_ALL
                }
            },
            fields: [
                {
                    modal_label: 'Tiny ID',
                    name: TakeOwnershipAlertForm.NOTE_TINY_ID,
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 1,
                }
            ]
        }
    }
}


export const getAllBinding = (): any => {
    const commands: string[] = [
        Commands.TEAM,
        Commands.ALERT
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
            },
            {
                icon: OpsGenieIcon,
                label: Commands.ALERT,
                description: 'List alerts',
                form: {
                    title: "",
                    icon: OpsGenieIcon,
                    submit: {
                        path: Routes.App.CallPathAlertsListSubmit,
                        expand: { }
                    }
                }
            }
        ]
    }
};

