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
    TakeOwnershipAlertForm,
    PriorityAlertForm,
    SubscriptionCreateForm,
    SubscriptionDeleteForm
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
                    app: AppExpandLevels.EXPAND_SUMMARY,
                }
            }
        }
    }
};

export const connectAccountBinding = (): any => {
    return {
        icon: OpsGenieIcon,
        label: Commands.CONNECT,
        description: 'Connect your OpsGenie account',
        form: {
            title: "Connect account",
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathConnectSubmit,
                expand: {
                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY
                }
            }
        }
    }
};

export const subscriptionBinding = (): AppBinding => {
    const subCommands: string[] = [
        Commands.ADD,
        Commands.DELETE,
        Commands.LIST
    ];

    const bindings: AppBinding[] = [];

    bindings.push(subscriptionAddBinding());
    bindings.push(subscriptionDeleteBinding());
    bindings.push(subscriptionListBinding());

    return {
        icon: OpsGenieIcon,
        label: Commands.SUBSCRIPTION,
        description: 'Subscription teams of OpsGenie to Mattermost channel',
        hint: `[${subCommands.join(' | ')}]`,
        bindings
    }
};

export const subscriptionAddBinding = (): any => {
    return {
        icon: OpsGenieIcon,
        label: Commands.ADD,
        description: 'Add a team subscription to a channel',
        form: {
            title: "Add a team subscription to a channel",
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathSubscriptionAddSubmit,
                expand: {
                    app: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
                }
            },
            fields: [
                {
                    modal_label: 'Team name',
                    name: SubscriptionCreateForm.TEAM_NAME,
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 1,
                    max_length: 100
                },
                {
                    modal_label: 'Channel',
                    name: SubscriptionCreateForm.CHANNEL_ID,
                    type: AppFieldTypes.CHANNEL,
                    is_required: true,
                    position: 2
                }
            ]
        }
    }
};

export const subscriptionDeleteBinding = (): any => {
    return {
        icon: OpsGenieIcon,
        label: Commands.DELETE,
        description: 'Unsubscribe team from channel',
        form: {
            title: "Unsubscribe team from channel",
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathSubscriptionDeleteSubmit,
                expand: {
                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY
                },
            },
            fields: [
                {
                    modal_label: 'Subscription ID',
                    name: SubscriptionDeleteForm.SUBSCRIPTION_ID,
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 1,
                    max_length: 36,
                    min_length: 36
                }
            ]
        }
    }
};

export const subscriptionListBinding = (): any => {
    return {
        icon: OpsGenieIcon,
        label: Commands.LIST,
        description: 'List of teams subscribed to channels',
        form: {
            title: "List of teams subscribed to channels",
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathSubscriptionListSubmit,
                expand: {
                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY
                }
            }
        }
    }
};

export const alertBinding = (): AppBinding => {
    const subCommands: string[] = [
        Commands.CREATE,
        Commands.NOTE,
        Commands.CLOSE,
        Commands.ACK,
        Commands.UNACK,
        Commands.SNOOZE,
        Commands.ASSIGN,
        Commands.OWN,
        Commands.PRIORITY
    ];

    const bindings: AppBinding[] = [];

    bindings.push(createAlertBinding());
    bindings.push(addNoteToAlertBinding());
    bindings.push(closeAlertBinding());
    bindings.push(ackAlertBinding());
    bindings.push(unackAlertBinding());
    bindings.push(snoozeAlertBinding());
    bindings.push(assignAlertBinding());
    bindings.push(ownAlertBinding());
    bindings.push(updatePriorityAlertBinding());

    return {
        label: Commands.ALERT,
        icon: OpsGenieIcon,
        description: 'Config Alert in OpsGenie',
        hint: `[${subCommands.join(' | ')}]`,
        bindings
    }
}

const createAlertBinding = (): AppBinding => {
    return (
        {
            label: Commands.CREATE,
            icon: OpsGenieIcon,
            description: 'Create Alert in OpsGenie',
            form: {
                title: 'Create alert',
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
    );
};

const addNoteToAlertBinding = (): AppBinding => {
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

const closeAlertBinding = (): AppBinding => {
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

const ackAlertBinding = (): AppBinding => {
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

const unackAlertBinding = (): AppBinding => {
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

const snoozeAlertBinding = (): AppBinding => {
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

const assignAlertBinding = (): AppBinding => {
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

const ownAlertBinding = (): AppBinding => {
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

const updatePriorityAlertBinding = (): AppBinding => {
    return {
        label: Commands.PRIORITY,
        icon: OpsGenieIcon,
        description: 'Update priority of alert in OpsGenie',
        form: {
            title: 'Update priority of th alert',
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathUpdatePriorityAlertSubmit,
                expand: {
                    acting_user: AppExpandLevels.EXPAND_ALL
                }
            },
            fields: [
                {
                    modal_label: 'Tiny ID',
                    name: PriorityAlertForm.NOTE_TINY_ID,
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 1,
                },
                {
                    modal_label: 'Priority',
                    name: PriorityAlertForm.ALERT_PRIORITY,
                    type: AppFieldTypes.STATIC_SELECT,
                    is_required: true,
                    position: 2,
                    options: options_alert_priority
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

