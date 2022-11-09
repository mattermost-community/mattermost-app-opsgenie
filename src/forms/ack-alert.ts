import {
		Alert, AlertAck,
		AlertWebhook,
		AppCallAction,
		AppCallRequest,
		AppCallValues, AppContext,
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
import {configureI18n} from "../utils/translations";
import {getAlertLink, tryPromise} from '../utils/utils';
import {Exception} from "../utils/exception";
import { MattermostClient, MattermostOptions } from '../clients/mattermost';
import config from '../config';

export async function ackAlertCall(call: AppCallRequest): Promise<string> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const username: string | undefined = call.context.acting_user?.username;
    const values: AppCallValues | undefined = call.values;
		const i18nObj = configureI18n(call.context);

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
    const response: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
    const alert: Alert = response.data;
    const alertURL: string = await getAlertLink(alertTinyId, alert.id, opsGenieClient);

    if (alert.acknowledged) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.exception-ack', { url: alertURL }));
    }

    const data: AlertAck = {
        user: username
    };
    await tryPromise(opsGenieClient.acknowledgeAlert(identifier, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
    return i18nObj.__('forms.response-ack', { url: alertURL });
}

export async function ackAlertAction(call: AppCallAction<AppContextAction>, context: AppContext): Promise<string> {
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
		const i18nObj = configureI18n(context);

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
        const response: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
        const alert: Alert = response.data;
        if (alert.acknowledged) {
            throw new Error(i18nObj.__('forms.response-ack', { url: alert.tinyId }));
        }

        const data: AlertAck = {
            user: username
        };
        await tryPromise(opsGenieClient.acknowledgeAlert(identifier, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
        message = i18nObj.__('forms.message-ack', { alert: alert.tinyId });
    } catch (error: any) {
        acknowledged = true;
        message = i18nObj.__('forms.error-ack', { message: error.message });
    }

    await mattermostClient.updatePost(postId, await bodyPostUpdate(call, acknowledged, context));
    return message;
}

export const bodyPostUpdate = async (call: AppCallAction<AppContextAction>, acknowledged: boolean, context: AppContext) => {
    const alert: AppCallValues | undefined = call.context.alert;
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const postId = call.post_id;
		const i18nObj = configureI18n(context);

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(options);
    const originalPost: PostResponse = await tryPromise(mattermostClient.getPost(postId), ExceptionType.MARKDOWN, i18nObj.__('forms.mattermost-error'));
    
    const attach = originalPost.props.attachments[0];
    const ackAction = {
        id: acknowledged ? ActionsEvents.ACKNOWLEDGED_ALERT_BUTTON_EVENT : ActionsEvents.UNACKNOWLEDGE_ALERT_BUTTON_EVENT,
        name: acknowledged ? i18nObj.__('forms.acknowledged') : i18nObj.__('forms.unacknowledged'),
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
                            name: i18nObj.__('forms.name-close'),
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
                            name: i18nObj.__('forms.name-other-action'),
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
