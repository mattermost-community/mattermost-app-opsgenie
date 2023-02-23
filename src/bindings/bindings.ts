import { AppBinding, AppContext } from '../types';
import {
    AckAlertForm,
    AlertCreateForm,
    AppExpandLevels,
    AppFieldTypes,
    AssignAlertForm,
    CloseAlertForm,
    Commands,
    NoteCreateForm,
    OpsGenieIcon,
    PriorityAlertForm,
    Routes,
    SnoozeAlertForm,
    TakeOwnershipAlertForm,
    UnackAlertForm,
    option_alert_priority_p3,
    options_alert_priority,
    options_alert_time,
} from '../constant';
import { configureI18n } from '../utils/translations';
import { ExtendRequired } from '../utils/user-mapping';

export const getHelpBinding = (context: AppContext): any => {
    const i18nObj = configureI18n(context);

    return {
        label: Commands.HELP,
        icon: OpsGenieIcon,
        description: i18nObj.__('binding.binding.command-help'),
        form: {
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathHelp,
                expand: {
                    ...ExtendRequired,
                    app: AppExpandLevels.EXPAND_ALL,
                },
            },
        },
    };
};

export const getConfigureBinding = (context: AppContext): any => {
    const i18nObj = configureI18n(context);

    return {
        icon: OpsGenieIcon,
        label: Commands.CONFIGURE,
        description: i18nObj.__('binding.binding.command-configure'),
        form: {
            title: i18nObj.__('binding.binding.command-configure-title'),
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathConfigForm,
                expand: {
                    ...ExtendRequired,
                    app: AppExpandLevels.EXPAND_ALL,
                },
            },
        },
    };
};

export const getSettingsBinding = (context: AppContext): any => {
    const i18nObj = configureI18n(context);

    return {
        icon: OpsGenieIcon,
        label: Commands.SETTINGS,
        description: i18nObj.__('binding.binding.command-settings'),
        form: {
            title: i18nObj.__('binding.binding.command-settings'),
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathSettingsForm,
                expand: {
                    ...ExtendRequired,
                    app: AppExpandLevels.EXPAND_ALL,
                },
            },
        },
    };
};

export const connectAccountBinding = (context: AppContext): any => {
    const subCommands: string[] = [
        Commands.LOGIN,
        Commands.LOGOUT,
    ];
    const i18nObj = configureI18n(context);

    const bindings: AppBinding[] = [];

    bindings.push(accountLoginBinding(context));
    bindings.push(accountLogoutBinding(context));

    return {
        icon: OpsGenieIcon,
        label: Commands.ACCOUNT,
        description: i18nObj.__('binding.binding.command-account-description'),
        hint: `[${subCommands.join(' | ')}]`,
        bindings,
    };
};

export const accountLoginBinding = (context: AppContext): any => {
    const i18nObj = configureI18n(context);

    return {
        icon: OpsGenieIcon,
        label: Commands.LOGIN,
        description: i18nObj.__('binding.binding.command-login'),
        form: {
            title: i18nObj.__('binding.binding.command-login-title'),
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathConnectSubmit,
                expand: {
                    ...ExtendRequired,
                    app: AppExpandLevels.EXPAND_ALL,
                },
            },
        },
    };
};

export const accountLogoutBinding = (context: AppContext): any => {
    const i18nObj = configureI18n(context);

    return {
        icon: OpsGenieIcon,
        label: Commands.LOGIN,
        description: i18nObj.__('binding.binding.command-account-description'),
        form: {
            title: i18nObj.__('binding.binding.command-logout-title'),
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathConnectSubmit,
                expand: {
                    ...ExtendRequired,
                    app: AppExpandLevels.EXPAND_ALL,
                },
            },
        },
    };
};

export const subscriptionBinding = (context: AppContext): AppBinding => {
    const i18nObj = configureI18n(context);

    const subCommands: string[] = [
        Commands.ADD,
        Commands.DELETE,
        Commands.LIST,
    ];

    const bindings: AppBinding[] = [];

    bindings.push(subscriptionAddBinding(context));
    bindings.push(subscriptionDeleteBinding(context));
    bindings.push(subscriptionListBinding(context));

    return {
        icon: OpsGenieIcon,
        label: Commands.SUBSCRIPTION,
        description: i18nObj.__('binding.binding.command-subcription-description'),
        hint: `[${subCommands.join(' | ')}]`,
        bindings,
    };
};

export const subscriptionAddBinding = (context: AppContext): any => {
    const i18nObj = configureI18n(context);

    return {
        icon: OpsGenieIcon,
        label: Commands.ADD,
        description: i18nObj.__('binding.binding.command-add-description'),
        form: {
            title: i18nObj.__('binding.binding.command-add-title'),
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathSubscriptionAddForm,
                expand: {
                    ...ExtendRequired,
                    app: AppExpandLevels.EXPAND_ALL,
                    channel: AppExpandLevels.EXPAND_SUMMARY,
                },
            },
        },
    };
};

export const subscriptionDeleteBinding = (context: AppContext): any => {
    const i18nObj = configureI18n(context);

    return {
        icon: OpsGenieIcon,
        label: Commands.DELETE,
        description: i18nObj.__('binding.binding.command-delete-description'),
        form: {
            title: i18nObj.__('binding.binding.command-delete-title'),
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathSubscriptionDeleteForm,
                expand: {
                    ...ExtendRequired,
                    app: AppExpandLevels.EXPAND_ALL,
                },
            },
            fields: [],
        },
    };
};

export const subscriptionListBinding = (context: AppContext): any => {
    const i18nObj = configureI18n(context);

    return {
        icon: OpsGenieIcon,
        label: Commands.LIST,
        description: i18nObj.__('binding.binding.command-list-description'),
        form: {
            title: i18nObj.__('binding.binding.command-list-title'),
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathSubscriptionListSubmit,
                expand: {
                    ...ExtendRequired,
                    app: AppExpandLevels.EXPAND_ALL,
                },
            },
        },
    };
};

export const alertBinding = (context: AppContext): AppBinding => {
    const i18nObj = configureI18n(context);

    const subCommands: string[] = [
        Commands.CREATE,
        Commands.NOTE,
        Commands.CLOSE,
        Commands.ACK,
        Commands.UNACK,
        Commands.SNOOZE,
        Commands.ASSIGN,
        Commands.OWN,
        Commands.PRIORITY,
        Commands.LIST,
    ];

    const bindings: AppBinding[] = [];

    bindings.push(createAlertBinding(context));
    bindings.push(addNoteToAlertBinding(context));
    bindings.push(closeAlertBinding(context));
    bindings.push(ackAlertBinding(context));
    bindings.push(unackAlertBinding(context));
    bindings.push(snoozeAlertBinding(context));
    bindings.push(assignAlertBinding(context));
    bindings.push(ownAlertBinding(context));
    bindings.push(updatePriorityAlertBinding(context));
    bindings.push(listAlertBindig(context));

    return {
        label: Commands.ALERT,
        icon: OpsGenieIcon,
        description: i18nObj.__('binding.binding.command-alert-description'),
        hint: `[${subCommands.join(' | ')}]`,
        bindings,
    };
};

const createAlertBinding = (context: AppContext): AppBinding => {
    const i18nObj = configureI18n(context);

    return (
        {
            label: Commands.CREATE,
            icon: OpsGenieIcon,
            description: i18nObj.__('binding.binding.command-create-description'),
            form: {
                title: i18nObj.__('binding.binding.command-create-title'),
                icon: OpsGenieIcon,
                submit: {
                    path: Routes.App.CallPathAlertCreate,
                    expand: {
                        ...ExtendRequired,
                        app: AppExpandLevels.EXPAND_ALL,
                    },
                },
                fields: [
                    {
                        modal_label: i18nObj.__('binding.binding.label-alert'),
                        name: AlertCreateForm.ALERT_MESSAGE,
                        subtype: 'textarea',
                        type: AppFieldTypes.TEXT,
                        is_required: true,
                        position: 1,
                        max_length: 130,
                    },
                    {
                        modal_label: i18nObj.__('binding.binding.label-team'),
                        name: AlertCreateForm.TEAM_NAME,
                        type: AppFieldTypes.TEXT,
                        is_required: true,
                        position: 2,
                        max_length: 100,
                    },
                    {
                        modal_label: 'binding.binding.label-priority',
                        name: AlertCreateForm.ALERT_PRIORITY,
                        type: AppFieldTypes.STATIC_SELECT,
                        is_required: false,
                        position: 3,
                        options: options_alert_priority,
                        value: options_alert_priority.find((value) => value.value === option_alert_priority_p3),
                    },
                ],
            },
        }
    );
};

const addNoteToAlertBinding = (context: AppContext): AppBinding => {
    const i18nObj = configureI18n(context);

    return {
        label: Commands.NOTE,
        icon: OpsGenieIcon,
        description: i18nObj.__('binding.binding.command-note-description'),
        form: {
            title: i18nObj.__('binding.binding.command-note-title'),
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathNoteToAlertSubmit,
                expand: {
                    ...ExtendRequired,
                    app: AppExpandLevels.EXPAND_ALL,
                },
            },
            fields: [
                {
                    modal_label: i18nObj.__('binding.binding.label-note'),
                    name: NoteCreateForm.NOTE_MESSAGE,
                    subtype: 'textarea',
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 1,
                    max_length: 25000,
                },
                {
                    modal_label: i18nObj.__('binding.binding.label-tiny'),
                    name: NoteCreateForm.NOTE_TINY_ID,
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 2,
                },
            ],
        },
    };
};

const closeAlertBinding = (context: AppContext): AppBinding => {
    const i18nObj = configureI18n(context);

    return {
        label: Commands.CLOSE,
        icon: OpsGenieIcon,
        description: i18nObj.__('binding.binding.command-close-description'),
        form: {
            title: i18nObj.__('binding.binding.command-close-title'),
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathAlertCloseAction,
                expand: {
                    ...ExtendRequired,
                    app: AppExpandLevels.EXPAND_ALL,
                },
            },
            fields: [
                {
                    modal_label: i18nObj.__('binding.binding.label-tiny'),
                    name: CloseAlertForm.NOTE_TINY_ID,
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 1,
                },
            ],
        },
    };
};

const ackAlertBinding = (context: AppContext): AppBinding => {
    const i18nObj = configureI18n(context);

    return {
        label: Commands.ACK,
        icon: OpsGenieIcon,
        description: i18nObj.__('binding.binding.command-ack-description'),
        form: {
            title: i18nObj.__('binding.binding.command-ack-title'),
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathAlertAcknowledgedSubmit,
                expand: {
                    ...ExtendRequired,
                    app: AppExpandLevels.EXPAND_ALL,
                },
            },
            fields: [
                {
                    modal_label: i18nObj.__('binding.binding.label-tiny'),
                    name: AckAlertForm.NOTE_TINY_ID,
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 1,
                },
            ],
        },
    };
};

const unackAlertBinding = (context: AppContext): AppBinding => {
    const i18nObj = configureI18n(context);

    return {
        label: Commands.UNACK,
        icon: OpsGenieIcon,
        description: i18nObj.__('binding.binding.command-unack-description'),
        form: {
            title: i18nObj.__('binding.binding.command-unack-title'),
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathAlertUnacknowledge,
                expand: {
                    ...ExtendRequired,
                    app: AppExpandLevels.EXPAND_ALL,
                },
            },
            fields: [
                {
                    modal_label: i18nObj.__('binding.binding.label-tiny'),
                    name: UnackAlertForm.NOTE_TINY_ID,
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 1,
                },
            ],
        },
    };
};

const snoozeAlertBinding = (context: AppContext): AppBinding => {
    const i18nObj = configureI18n(context);

    return {
        label: Commands.SNOOZE,
        icon: OpsGenieIcon,
        description: i18nObj.__('binding.binding.command-snooze-description'),
        form: {
            title: i18nObj.__('binding.binding.command-snooze-title'),
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathSnoozeAlert,
                expand: {
                    ...ExtendRequired,
                    app: AppExpandLevels.EXPAND_ALL,
                },
            },
            fields: [
                {
                    modal_label: i18nObj.__('binding.binding.label-tiny'),
                    name: SnoozeAlertForm.NOTE_TINY_ID,
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 1,
                },
                {
                    modal_label: i18nObj.__('binding.binding.label-time'),
                    name: SnoozeAlertForm.TIME_AMOUNT,
                    type: AppFieldTypes.STATIC_SELECT,
                    is_required: true,
                    position: 2,
                    options: options_alert_time,
                },
            ],
        },
    };
};

const assignAlertBinding = (context: AppContext): AppBinding => {
    const i18nObj = configureI18n(context);

    return {
        label: Commands.ASSIGN,
        icon: OpsGenieIcon,
        description: i18nObj.__('binding.binding.command-assign-desctiption'),
        form: {
            title: i18nObj.__('binding.binding.command-assign-title'),
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathAssignAlertSubmit,
                expand: {
                    ...ExtendRequired,
                    app: AppExpandLevels.EXPAND_ALL,
                },
            },
            fields: [
                {
                    modal_label: i18nObj.__('binding.binding.label-tiny'),
                    name: AssignAlertForm.NOTE_TINY_ID,
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 1,
                },
                {
                    modal_label: i18nObj.__('binding.binding.label-user'),
                    name: AssignAlertForm.USER_ID,
                    type: AppFieldTypes.USER,
                    is_required: true,
                    position: 2,
                },
            ],
        },
    };
};

const ownAlertBinding = (context: AppContext): AppBinding => {
    const i18nObj = configureI18n(context);

    return {
        label: Commands.OWN,
        icon: OpsGenieIcon,
        description: i18nObj.__('binding.binding.command-own-description'),
        form: {
            title: i18nObj.__('binding.binding.command-own-title"'),
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathTakeOwnershipAlertSubmit,
                expand: {
                    ...ExtendRequired,
                    app: AppExpandLevels.EXPAND_ALL,
                },
            },
            fields: [
                {
                    modal_label: i18nObj.__('binding.binding.label-tiny'),
                    name: TakeOwnershipAlertForm.NOTE_TINY_ID,
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 1,
                },
            ],
        },
    };
};

const updatePriorityAlertBinding = (context: AppContext): AppBinding => {
    const i18nObj = configureI18n(context);

    return {
        label: Commands.PRIORITY,
        icon: OpsGenieIcon,
        description: i18nObj.__('binding.binding.command-priority-description'),
        form: {
            title: i18nObj.__('binding.binding.command-priority-title'),
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathUpdatePriorityAlertSubmit,
                expand: {
                    ...ExtendRequired,
                    app: AppExpandLevels.EXPAND_ALL,
                },
            },
            fields: [
                {
                    modal_label: i18nObj.__('binding.binding.label-tiny'),
                    name: PriorityAlertForm.NOTE_TINY_ID,
                    type: AppFieldTypes.TEXT,
                    is_required: true,
                    position: 1,
                },
                {
                    modal_label: i18nObj.__('binding.binding.label-priority'),
                    name: PriorityAlertForm.ALERT_PRIORITY,
                    type: AppFieldTypes.STATIC_SELECT,
                    is_required: true,
                    position: 2,
                    options: options_alert_priority,
                },
            ],
        },
    };
};

const listAlertBindig = (context: AppContext): AppBinding => {
    const i18nObj = configureI18n(context);

    return {
        label: Commands.LIST,
        icon: OpsGenieIcon,
        description: i18nObj.__('binding.binding.description-alert'),
        form: {
            title: i18nObj.__('binding.binding.description-alert'),
            icon: OpsGenieIcon,
            fields: [],
            submit: {
                path: Routes.App.CallPathAlertsListSubmit,
                expand: {
                    ...ExtendRequired,
                },
            },
        },
    };
};

export const getTeamBinding = (context: AppContext): any => {
    const i18nObj = configureI18n(context);

    return {
        icon: OpsGenieIcon,
        label: Commands.TEAM,
        description: i18nObj.__('binding.binding.command-teams'),
        hint: `[${Commands.LIST}]`,
        bindings: [
            {
                icon: OpsGenieIcon,
                label: Commands.LIST,
                description: i18nObj.__('binding.binding.command-list-all-title'),
                form: {
                    title: '',
                    icon: OpsGenieIcon,
                    submit: {
                        path: Routes.App.CallPathTeamsListSubmit,
                        expand: {
                            ...ExtendRequired,
                        },
                    },
                },
            },
        ],
    };
};