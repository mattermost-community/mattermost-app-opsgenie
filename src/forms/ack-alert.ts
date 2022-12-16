import {
    Alert, AlertAck,
    AppCallAction,
    AppCallRequest,
    AppCallValues, AppContext,
    AppContextAction,
    Identifier,
    IdentifierType,
    Manifest,
    PostResponse,
    PostUpdate,
    ResponseResultWithData,
} from '../types';
import { AckAlertForm, ActionsEvents, ExceptionType, Routes, StoreKeys, AppExpandLevels, ExtraOptionsEvents } from '../constant';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { ConfigStoreProps, KVStoreClient, KVStoreOptions } from '../clients/kvstore';
import { configureI18n } from '../utils/translations';
import { getAlertLink, tryPromise } from '../utils/utils';
import { Exception } from '../utils/exception';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';
import config from '../config';
import manifest from '../manifest.json';
import { url } from 'inspector';
import { h6 } from '../utils/markdown';

export async function ackAlertCall(call: AppCallRequest): Promise<string> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const username: string | undefined = call.context.acting_user?.username;
    const values: AppCallValues | undefined = call.values;
    const i18nObj = configureI18n(call.context);

    const alertTinyId: string = typeof values?.[AckAlertForm.NOTE_TINY_ID] === 'undefined' ?
        call.state.alert.tinyId as string :
        values?.[AckAlertForm.NOTE_TINY_ID];

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const kvConfig: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: kvConfig.opsgenie_apikey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY,
    };
    const response: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
    const alert: Alert = response.data;
    const alertURL: string = await getAlertLink(alertTinyId, alert.id, opsGenieClient);

    if (alert.acknowledged) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.exception-ack', { url: alertURL }));
    }

    const data: AlertAck = {
        user: username,
    };
    await tryPromise(opsGenieClient.acknowledgeAlert(identifier, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
    return i18nObj.__('forms.response-ack', { url: alertURL });
}

export async function ackAlertAction(call: AppCallAction<AppContextAction>): Promise<string> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const username: string = call.context.acting_user.username as string;
    const alertTinyId: string = call.state.alert.tinyId as string;
    const postId: string = call.context.post.id as string;
    const i18nObj = configureI18n(call.context);

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };

    const mattermostClient: MattermostClient = new MattermostClient(options);
    const kvStoreClient = new KVStoreClient(options);
    const kvConfig: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: kvConfig.opsgenie_apikey,
    };

    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY,
    };
    const response: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
    const alert: Alert = response.data;
    const alertURL: string = await getAlertLink(alertTinyId, alert.id, opsGenieClient);

    await mattermostClient.updatePost(postId, bodyPostUpdate(call, true));

    if (Boolean(alert.acknowledged)) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.exception-ack', { url: alertURL }));
    }

    const data: AlertAck = {
        user: username,
    };

    await tryPromise(opsGenieClient.acknowledgeAlert(identifier, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));

    return i18nObj.__('forms.response-ack', { url: alertURL });
}

export const bodyPostUpdate = (call: AppCallAction<AppContextAction>, acknowledged: boolean): PostUpdate => {
    const alert = call.state.alert;
    const postId = call.context.post.id;
    const i18nObj = configureI18n(call.context);
    const state = call.state;
    const m: Manifest = manifest;

    const ackAction = {
        location: acknowledged ? ActionsEvents.UNACKNOWLEDGE_ALERT_BUTTON_EVENT : ActionsEvents.ACKNOWLEDGED_ALERT_BUTTON_EVENT,
        label: acknowledged ? i18nObj.__('forms.unacknowledged') : i18nObj.__('forms.acknowledged'),
        path: acknowledged ? Routes.App.CallPathAlertUnacknowledgeAction : Routes.App.CallPathAlertAcknowledgedAction
    };

    // ACKNOWLEDGED_ALERT_BUTTON_EVENT
    return {
        message: '',
        id: postId,
        props: {
            app_bindings: [
                {
                    app_id: m.app_id,
                    location: "embedded",
                    description: h6(i18nObj.__('api.webhook.title', { text: `${alert.tinyId}: ${alert.message}`, url })),
                    bindings: [
                        {
                            location: ackAction.location,
                            label: ackAction.label,
                            submit: {
                                path: ackAction.path,
                                expand: {
                                    acting_user: AppExpandLevels.EXPAND_ALL,
                                    acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                                    post: AppExpandLevels.EXPAND_SUMMARY
                                },
                                state
                            }
                        },
                        {
                            location: ActionsEvents.CLOSE_ALERT_BUTTON_EVENT,
                            label: i18nObj.__('api.webhook.name-close'),
                            submit: {
                                path: Routes.App.CallPathAlertCloseAction,
                                expand: {
                                    acting_user: AppExpandLevels.EXPAND_ALL,
                                    acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                                    post: AppExpandLevels.EXPAND_SUMMARY
                                },
                                state
                            }
                        },
                        {
                            location: ActionsEvents.OTHER_OPTIONS_SELECT_EVENT,
                            label: i18nObj.__('api.webhook.name-other'),
                            bindings: [
                                {
                                    location: ExtraOptionsEvents.ALERT_ADD_NOTE,
                                    label: i18nObj.__('api.webhook.extra-options.add-note'),
                                    submit: {
                                        path: Routes.App.CallPathAlertOtherActions,
                                        expand: {
                                            acting_user: AppExpandLevels.EXPAND_ALL,
                                            acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                                            post: AppExpandLevels.EXPAND_SUMMARY
                                        },
                                        state: {
                                            ...state,
                                            action: ExtraOptionsEvents.ALERT_ADD_NOTE,
                                        }
                                    }
                                },
                                {
                                    location: ExtraOptionsEvents.ALERT_ASSIGN,
                                    label: i18nObj.__('api.webhook.extra-options.assign'),
                                    submit: {
                                        path: Routes.App.CallPathAlertOtherActions,
                                        expand: {
                                            acting_user: AppExpandLevels.EXPAND_ALL,
                                            acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                                            post: AppExpandLevels.EXPAND_SUMMARY
                                        },
                                        state: {
                                            ...state,
                                            action: ExtraOptionsEvents.ALERT_ASSIGN,
                                        }
                                    }
                                },
                                {
                                    location: ExtraOptionsEvents.ALERT_SNOOZE,
                                    label: i18nObj.__('api.webhook.extra-options.snooze'),
                                    submit: {
                                        path: Routes.App.CallPathAlertOtherActions,
                                        expand: {
                                            acting_user: AppExpandLevels.EXPAND_ALL,
                                            acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                                            post: AppExpandLevels.EXPAND_SUMMARY
                                        },
                                        state: {
                                            ...state,
                                            action: ExtraOptionsEvents.ALERT_SNOOZE,
                                        }
                                    }
                                },
                                {
                                    location: ExtraOptionsEvents.ALERT_TAKE_OWNERSHIP,
                                    label: i18nObj.__('api.webhook.extra-options.take-ownership'),
                                    submit: {
                                        path: Routes.App.CallPathAlertOtherActions,
                                        expand: {
                                            acting_user: AppExpandLevels.EXPAND_ALL,
                                            acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                                            post: AppExpandLevels.EXPAND_SUMMARY
                                        },
                                        state: {
                                            ...state,
                                            action: ExtraOptionsEvents.ALERT_TAKE_OWNERSHIP,
                                        }
                                    }
                                },
                            ]
                        }
                    ]
                },
            ]
        },
    };
};
