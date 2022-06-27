import {
    Alert,
    AlertAssign,
    AppCallAction,
    AppCallResponse,
    AppContextAction,
    DialogProps,
    Identifier,
    IdentifierType,
    PostCreate,
    PostEphemeralCreate,
    ResponseResultWithData,
    User
} from '../types';
import {MattermostClient, MattermostOptions} from '../clients/mattermost';
import {
    ActionsEvents,
    option_alert_assign,
    option_alert_add_note,
    option_alert_take_ownership,
    option_alert_snooze,
    options_times,
    Routes,
    NoteModalForm,
    ExceptionType,
    StoreKeys
} from '../constant';
import config from '../config';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import { tryPromise } from '../utils/utils';
import { ConfigStoreProps, KVStoreClient, KVStoreOptions } from '../clients/kvstore';
import { Exception } from '../utils/exception';
import { newErrorCallResponseWithMessage } from '../utils/call-responses';

async function showModalNoteToAlert(call: AppCallAction<AppContextAction>): Promise<void> {
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
        url: `${config.APP.HOST}${Routes.App.CallPathNoteToAlertAction}`,
        dialog: {
            title: 'Add Note',
            icon_url: `${config.APP.HOST}/static/opsgenie.png`,
            submit_label: 'Add',
            state: JSON.stringify(call.context),
            elements: [
                {
                    display_name: 'Note',
                    type: 'textarea',
                    name: NoteModalForm.NOTE_MESSAGE,
                    placeholder: 'Your note here...',
                    optional: false,
                    max_length: 25000
                }
            ],
        }
    };
    await mattermostClient.showDialog(dialogProps);
}

async function showPostOfListUsers(call: AppCallAction<AppContextAction>): Promise<void> {
    const mattermostUrl: string = call.context.mattermost_site_url;
    const channelId: string = call.channel_id;
    const accessToken: string = call.context.bot_access_token;
    const alert: any = call.context.alert;

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
                            id: ActionsEvents.USER_SELECT_EVENT,
                            name: "Choose a user",
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathAssignAlertAction}`,
                                context: {
                                    action: ActionsEvents.USER_SELECT_EVENT,
                                    bot_access_token: call.context.bot_access_token,
                                    mattermost_site_url: mattermostUrl,
                                    alert
                                } as AppContextAction
                            },
                            type: 'select',
                            data_source: 'users'
                        },
                        {
                            id: ActionsEvents.CANCEL_BUTTON_EVENT,
                            name: 'Close',
                            type: 'button',
                            style: 'default',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathCloseOptions}`,
                                context: {
                                    action: ActionsEvents.CANCEL_BUTTON_EVENT,
                                    bot_access_token: call.context.bot_access_token,
                                    mattermost_site_url: mattermostUrl
                                } as AppContextAction
                            }
                        }
                    ]
                }
            ]
        }
    };
    await mattermostClient.createPost(postCreate);
}

async function showPostOfTimes(call: AppCallAction<AppContextAction>): Promise<void> {
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
                            id: ActionsEvents.TIME_SELECT_EVENT,
                            name: "Choose snooze time",
                            type: 'select',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathSnoozeAlertAction}`,
                                context: {
                                    action: ActionsEvents.TIME_SELECT_EVENT,
                                    bot_access_token: call.context.bot_access_token,
                                    mattermost_site_url: mattermostUrl,
                                    alert: call.context.alert
                                } as AppContextAction
                            },
                            options: options_times
                        },
                        {
                            id: ActionsEvents.CANCEL_BUTTON_EVENT,
                            name: 'Close',
                            type: 'button',
                            style: 'default',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathCloseOptions}`,
                                context: {
                                    action: ActionsEvents.CANCEL_BUTTON_EVENT,
                                    bot_access_token: call.context.bot_access_token,
                                    mattermost_site_url: mattermostUrl
                                } as AppContextAction
                            }
                        }
                    ]
                }
            ]
        }
    };
    await mattermostClient.createPost(postCreate);
}

async function showPostTakeOwnership(call: AppCallAction<AppContextAction>): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const channelId: string | undefined = call.channel_id;
    let message: string;

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };

    const mattermostClient: MattermostClient = new MattermostClient(options);

    try{
        const alertTinyId: string = call.context.alert.tinyId;
        const userId: string | undefined = call.user_id;
        const username: string | undefined = call.user_name;
        const kvStoreClient = new KVStoreClient(options);
    
        const config: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);
        const opsGenieOpt: OpsGenieOptions = {
            api_key: config.opsgenie_apikey
        };
        const opsGenieClient = new OpsGenieClient(opsGenieOpt);
    
        const mattermostUser: User = await mattermostClient.getUser(<string>userId);
    
        const identifierUser: Identifier = {
            identifier: mattermostUser.email,
            identifierType: IdentifierType.USERNAME
        }
        
        await tryPromise(opsGenieClient.getUser(identifierUser), ExceptionType.MARKDOWN, 'OpsGenie failed');
    
        const identifier: Identifier = {
            identifier: alertTinyId,
            identifierType: IdentifierType.TINY
        };
        const responseAlert: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, 'OpsGenie failed');
        const alert: Alert = responseAlert.data;
    
        if (alert.owner === mattermostUser.email) {
            throw new Exception(ExceptionType.MARKDOWN, `You already are alert #${alert.tinyId} owner`);
        }
    
        const data: AlertAssign = {
            user: username,
            owner: {
                username: mattermostUser.email
            }
        };
        
        await tryPromise(opsGenieClient.assignAlert(identifier, data), ExceptionType.MARKDOWN, 'OpsGenie failed');
        
        message = `Take ownership request will be processed for #${alert.tinyId}`;
    } catch (error: any) {
        message = 'Unexpected error: ' + error.message;
    }

    const post: PostEphemeralCreate = {
        post: {
            message: message,
            channel_id: channelId,
        },
        user_id: call.user_id,
    };
    await mattermostClient.createEphemeralPost(post);
}

const ACTIONS_EVENT: { [key: string]: Function|{[key: string]: Function} } = {
    [ActionsEvents.OTHER_OPTIONS_SELECT_EVENT]: {
        [option_alert_assign]: showPostOfListUsers,
        [option_alert_add_note]: showModalNoteToAlert,
        [option_alert_take_ownership]: showPostTakeOwnership,
        [option_alert_snooze]: showPostOfTimes,
    }
};

export async function otherActionsAlertCall(call: AppCallAction<AppContextAction>): Promise<void> {
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
