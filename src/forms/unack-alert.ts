import {
    Alert,
    AlertUnack,
    AppCallAction,
    AppCallRequest,
    AppCallValues, AppContext,
    AppContextAction,
    Identifier,
    IdentifierType,
    PostEphemeralCreate,
    ResponseResultWithData,
} from '../types';
import { AckAlertForm, ExceptionType, StoreKeys } from '../constant';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { ConfigStoreProps, KVStoreClient, KVStoreOptions } from '../clients/kvstore';
import { configureI18n } from '../utils/translations';
import { getAlertLink, tryPromise } from '../utils/utils';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';

import { Exception } from '../utils/exception';

import { bodyPostUpdate } from './ack-alert';

export async function unackAlertCall(call: AppCallRequest): Promise<string> {
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
        api_key: config.opsgenie_apikey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY,
    };
    const response: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
    const alert: Alert = response.data;
    const alertURL: string = await getAlertLink(alertTinyId, alert.id, opsGenieClient);

    if (!alert.acknowledged) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.unack.exception-unack', { url: alertURL }));
    }

    const data: AlertUnack = {
        user: username,
    };
    await tryPromise(opsGenieClient.unacknowledgeAlert(identifier, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
    return i18nObj.__('forms.unack.response-unack', { url: alertURL });
}

export async function unackAlertAction(call: AppCallAction<AppContextAction>, context: AppContext): Promise<string> {
    let message: string;
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const username: string | undefined = call.user_name;
    const values: AppCallValues | undefined = call.context.alert;
    const channelId: string | undefined = call.channel_id;
    const alertTinyId: string = values?.[AckAlertForm.TINY_ID];
    const postId: string = call.post_id;
    let acknowledged = true;
    const i18nObj = configureI18n(context);

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
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
            api_key: config.opsgenie_apikey,
        };
        const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

        const identifier: Identifier = {
            identifier: alertTinyId,
            identifierType: IdentifierType.TINY,
        };
        const response: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
        const alert: Alert = response.data;
        if (!alert.acknowledged) {
            throw new Error(i18nObj.__('forms.unack.exception-ack', { alert: alert.tinyId }));
        }

        const data: AlertUnack = {
            user: username,
        };
        await tryPromise(opsGenieClient.unacknowledgeAlert(identifier, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
        message = i18nObj.__('forms.unack.response-ack', { alert: alert.tinyId });
    } catch (error: any) {
        acknowledged = false;
        message = i18nObj.__('forms.error-ack', { message: error.message });
    }

    const post: PostEphemeralCreate = {
        post: {
            message,
            channel_id: channelId,
        },
        user_id: call.user_id,
    };

    await mattermostClient.updatePost(postId, await bodyPostUpdate(call, acknowledged, context));
    return message;
}
