import {
    AlertAssign,
    AppCallAction,
    CloseAlertAction,
    DialogProps,
    Identifier,
    IdentifierType,
    PostCreate,
} from '../types';
import {MattermostClient, MattermostOptions} from '../clients/mattermost';
import {
    Actions,
    option_alert_assign,
    option_alert_add_note,
    option_alert_take_ownership,
    option_alert_snooze,
    options_times,
    Routes
} from '../constant';
import config from '../config';
import {OpsGenieClient} from '../clients/opsgenie';

async function showModalNoteToAlert(call: AppCallAction<CloseAlertAction>): Promise<void> {
    const mattermostUrl: string = call.context.mattermost_site_url;
    const triggerId: string = call.trigger_id;
    const accessToken: string = call.context.bot_access_token;
    const alertTinyId: string = call.context.alert.tinyId;

    const mattermostOptions: MattermostOptions = {
        mattermostUrl,
        accessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    const dialogProps: DialogProps = {
        trigger_id: triggerId,
        url: `${config.APP.HOST}${Routes.App.CallPathNoteToAlertModal}`,
        dialog: {
            title: 'Add Note',
            icon_url: `${config.APP.HOST}/static/opsgenie.png`,
            submit_label: 'Add',
            state: alertTinyId,
            elements: [
                {
                    display_name: 'Note',
                    type: 'textarea',
                    name: 'note',
                    placeholder: 'Your note here...',
                    optional: false
                }
            ],
        }
    }
    await mattermostClient.showDialog(dialogProps);
}

async function showPostOfListUsers(call: AppCallAction<CloseAlertAction>): Promise<void> {
    const mattermostUrl: string = call.context.mattermost_site_url;
    const channelId: string = call.channel_id;
    const accessToken: string = call.context.bot_access_token;

    const mattermostOptions: MattermostOptions = {
        mattermostUrl,
        accessToken: <string>accessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    const postCreate: PostCreate = {
        channel_id: channelId,
        message: '',
        props: {
            attachments: [
                {
                    title: `Choose a user to assign the alert to`,
                    actions: [
                        {
                            id: Actions.USER_SELECT_EVENT,
                            name: "Choose a user",
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathAssignOwnerAlert}`,
                                context: {
                                    action: Actions.USER_SELECT_EVENT,
                                    bot_access_token: call.context.bot_access_token,
                                    mattermost_site_url: mattermostUrl
                                } as CloseAlertAction
                            },
                            type: 'select',
                            data_source: 'users'
                        },
                        {
                            id: Actions.CANCEL_BUTTON_EVENT,
                            name: 'Close',
                            type: 'button',
                            style: 'default',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathCloseOptions}`,
                                context: {
                                    action: Actions.CANCEL_BUTTON_EVENT,
                                    bot_access_token: call.context.bot_access_token,
                                    mattermost_site_url: mattermostUrl
                                } as CloseAlertAction
                            }
                        }
                    ]
                }
            ]
        }
    };
    await mattermostClient.createPost(postCreate);
}

async function showPostOfTimes(call: AppCallAction<CloseAlertAction>): Promise<void> {
    const mattermostUrl: string = call.context.mattermost_site_url;
    const channelId: string = call.channel_id;
    const accessToken: string = call.context.bot_access_token;

    const mattermostOptions: MattermostOptions = {
        mattermostUrl,
        accessToken: <string>accessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    const postCreate: PostCreate = {
        channel_id: channelId,
        message: '',
        props: {
            attachments: [
                {
                    title: `For how long do you want to snooze notifications for this alert`,
                    actions: [
                        {
                            id: Actions.TIME_SELECT_EVENT,
                            name: "Choose snooze time",
                            type: 'select',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathSnoozeAlertCreate}`,
                                context: {
                                    action: Actions.TIME_SELECT_EVENT,
                                    bot_access_token: call.context.bot_access_token,
                                    mattermost_site_url: mattermostUrl
                                } as CloseAlertAction
                            },
                            options: options_times
                        },
                        {
                            id: Actions.CANCEL_BUTTON_EVENT,
                            name: 'Close',
                            type: 'button',
                            style: 'default',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathCloseOptions}`,
                                context: {
                                    action: Actions.CANCEL_BUTTON_EVENT,
                                    bot_access_token: call.context.bot_access_token,
                                    mattermost_site_url: mattermostUrl
                                } as CloseAlertAction
                            }
                        }
                    ]
                }
            ]
        }
    };
    await mattermostClient.createPost(postCreate);
}

async function showPostTakeOwnership(call: AppCallAction<CloseAlertAction>): Promise<void> {
    const alertTinyId: string = call.context.alert.tinyId;

    const opsGenieClient = new OpsGenieClient();

    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY
    }
    const data: AlertAssign = {
        owner: {
            id: ''
        }
    }
    await opsGenieClient.assignAlert(identifier, data);
}

const ACTIONS_EVENT: { [key: string]: Function|{[key: string]: Function} } = {
    [Actions.OTHER_OPTIONS_SELECT_EVENT]: {
        [option_alert_assign]: showPostOfListUsers,
        [option_alert_add_note]: showModalNoteToAlert,
        [option_alert_take_ownership]: showPostTakeOwnership,
        [option_alert_snooze]: showPostOfTimes,
    }
};

export async function otherActionsAlertCall(call: AppCallAction<CloseAlertAction>): Promise<void> {
    const action: string = call.context.action;
    const selectedOption: string|undefined = call.context.selected_option;

    const handle: Function|{[key: string]: Function} = ACTIONS_EVENT[action];
    if (handle && typeof handle === 'object') {
        const subHandle: Function = handle[<string>selectedOption];
        if (subHandle) {
            await subHandle(call);
        }
    } else if (handle && typeof handle === 'function') {
        await handle(call);
    }
}
