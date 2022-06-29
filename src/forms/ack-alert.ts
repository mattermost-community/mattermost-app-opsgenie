import {
    Alert, AlertAck,
    AlertWebhook,
    AppCallAction,
    AppCallRequest,
    AppCallValues, 
    AppContextAction,
    Identifier,
    IdentifierType,
    PostCreate,
    PostEphemeralCreate,
    PostResponse,
    ResponseResultWithData,
} from '../types';
import {AckAlertForm, ActionsEvents, ExceptionType, options_alert, Routes, StoreKeys} from '../constant';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {tryPromise} from '../utils/utils';
import {Exception} from "../utils/exception";
import { MattermostClient, MattermostOptions } from '../clients/mattermost';
import config from '../config';

export async function ackAlertCall(call: AppCallRequest): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const username: string | undefined = call.context.acting_user?.username;
    const values: AppCallValues | undefined = call.values;

    const alertTinyId: string = values?.[AckAlertForm.NOTE_TINY_ID];

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const config: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: config.opsgenie_apikey
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY
    };
    const response: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, 'OpsGenie failed');
    const alert: Alert = response.data;
    if (alert.acknowledged) {
        throw new Exception(ExceptionType.MARKDOWN, `You have acknowledged #${alert.tinyId}`);
    }

    const data: AlertAck = {
        user: username
    };
    await tryPromise(opsGenieClient.acknowledgeAlert(identifier, data), ExceptionType.MARKDOWN, 'OpsGenie failed');
}

export async function ackAlertAction(call: AppCallAction<AppContextAction>): Promise<string> {
    let message: string;
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const username: string | undefined = call.user_name;
    const values: AppCallValues | undefined = call.context.alert;
    const channelId: string | undefined = call.channel_id;
    const alertTinyId: string = values?.[AckAlertForm.TINY_ID];
    const postId: string = call.post_id;
    let acknowledged: boolean = false;
    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    try {
        const options: KVStoreOptions = {
            mattermostUrl: <string>mattermostUrl,
            accessToken: <string>botAccessToken,
        };
        const kvStoreClient = new KVStoreClient(options);

        const config: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

        const optionsOpsgenie: OpsGenieOptions = {
            api_key: config.opsgenie_apikey
        };
        const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

        const identifier: Identifier = {
            identifier: alertTinyId,
            identifierType: IdentifierType.TINY
        };
        const response: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, 'OpsGenie failed');
        const alert: Alert = response.data;
        if (alert.acknowledged) {
            throw new Error(`You already have acknowledged #${alert.tinyId}`);
        }

        const data: AlertAck = {
            user: username
        };
        await tryPromise(opsGenieClient.acknowledgeAlert(identifier, data), ExceptionType.MARKDOWN, 'OpsGenie failed');
        message = `You have acknowledged #${alert.tinyId}`;
    } catch (error: any) {
        acknowledged = true;
        message = 'Unexpected error: ' + error.message;
    }

    await mattermostClient.updatePost(postId, await bodyPostUpdate(call, acknowledged));
    return message;
}

export const bodyPostUpdate = async (call: AppCallAction<AppContextAction>, acknowledged: boolean) => {
    const alert: AppCallValues | undefined = call.context.alert;
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const postId = call.post_id;

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(options);
    const originalPost: PostResponse = await tryPromise(mattermostClient.getPost(postId), ExceptionType.MARKDOWN, 'Mattermost post update failed');
    
    const attach = originalPost.props.attachments[0];
    const ackAction = {
        id: acknowledged ? ActionsEvents.ACKNOWLEDGED_ALERT_BUTTON_EVENT : ActionsEvents.UNACKNOWLEDGE_ALERT_BUTTON_EVENT,
        name: acknowledged ? 'Acknowledged' : 'Unacknowledged',
        integrationUrl: acknowledged ? `${config.APP.HOST}${Routes.App.CallPathAlertAcknowledgedAction}` : `${config.APP.HOST}${Routes.App.CallPathAlertUnacknowledgeAction}`
    };

    return {
        id: postId,
        props: {
            attachments: [
                {
                    ...attach,
                    actions: [
                        {
                            id: ackAction.id,
                            name: ackAction.name,
                            type: 'button',
                            style: 'default',
                            integration: {
                                url: ackAction.integrationUrl,
                                context: {
                                    action: ActionsEvents.ACKNOWLEDGED_ALERT_BUTTON_EVENT,
                                    alert: {
                                        id: alert.alertId,
                                        message: alert.message,
                                        tinyId: alert.tinyId
                                    },
                                    bot_access_token: botAccessToken,
                                    mattermost_site_url: mattermostUrl
                                } as AppContextAction
                            }
                        },
                        {
                            id: ActionsEvents.CLOSE_ALERT_BUTTON_EVENT,
                            name: 'Close',
                            type: 'button',
                            style: 'success',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathAlertCloseAction}`,
                                context: {
                                    action: ActionsEvents.CLOSE_ALERT_BUTTON_EVENT,
                                    alert: {
                                        id: alert.alertId,
                                        message: alert.message,
                                        tinyId: alert.tinyId
                                    },
                                    bot_access_token: botAccessToken,
                                    mattermost_site_url: mattermostUrl
                                } as AppContextAction
                            }
                        },
                        {
                            id: ActionsEvents.OTHER_OPTIONS_SELECT_EVENT,
                            name: 'Other actions...',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathAlertOtherActions}`,
                                context: {
                                    action: ActionsEvents.OTHER_OPTIONS_SELECT_EVENT,
                                    alert: {
                                        id: alert.alertId,
                                        message: alert.message,
                                        tinyId: alert.tinyId
                                    },
                                    bot_access_token: botAccessToken,
                                    mattermost_site_url: mattermostUrl
                                } as AppContextAction
                            },
                            type: 'select',
                            options: options_alert
                        }
                    ]
                }
            ]
        }
    };
}