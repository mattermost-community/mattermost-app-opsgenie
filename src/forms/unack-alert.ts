import {
    Alert,
    AlertUnack,
    AppCallAction,
    AppCallRequest,
    AppCallValues,
    AppContextAction,
    Identifier,
    IdentifierType,
    ResponseResultWithData,
} from '../types';
import { AckAlertForm, ExceptionType } from '../constant';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { configureI18n } from '../utils/translations';
import { getAlertLink, tryPromise } from '../utils/utils';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';

import { Exception } from '../utils/exception';

import { canUserInteractWithAlert, getOpsGenieAPIKey } from '../utils/user-mapping';

import { bodyPostUpdate } from './ack-alert';

export async function unackAlertCall(call: AppCallRequest): Promise<string> {
    const username: string | undefined = call.context.acting_user?.username;
    const values: AppCallValues | undefined = call.values;
    const i18nObj = configureI18n(call.context);
    const apiKey = getOpsGenieAPIKey(call);

    if (!values) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('general.validation-form.values-not-found'), call.context.mattermost_site_url, call.context.app_path);
    }

    const alertTinyId: string = values?.[AckAlertForm.NOTE_TINY_ID];

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: apiKey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const alert: Alert = await canUserInteractWithAlert(call, alertTinyId);
    const alertURL: string = await getAlertLink(alertTinyId, alert.id, opsGenieClient, call.context.mattermost_site_url, call.context.app_path);

    if (!alert.acknowledged) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.unack.exception-unack', { url: alertURL }), call.context.mattermost_site_url, call.context.app_path);
    }

    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY,
    };

    const data: AlertUnack = {
        user: username,
    };
    await tryPromise(opsGenieClient.unacknowledgeAlert(identifier, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);
    return i18nObj.__('forms.unack.response-unack', { url: alertURL });
}

export async function unackAlertAction(call: AppCallAction<AppContextAction>): Promise<string> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const username: string | undefined = call.context.acting_user.username;
    const alertTinyId: string = call.state.alert.tinyId as string;
    const postId: string = call.context.post.id;
    const i18nObj = configureI18n(call.context);
    const apiKey = getOpsGenieAPIKey(call);

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: apiKey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY,
    };
    const alert: Alert = await canUserInteractWithAlert(call, alertTinyId);

    await mattermostClient.updatePost(postId, bodyPostUpdate(call, false));

    if (!Boolean(alert.acknowledged)) {
        throw new Error(i18nObj.__('forms.unack.exception-ack', { alert: alert.tinyId }));
    }

    const data: AlertUnack = {
        user: username,
    };

    await tryPromise(opsGenieClient.unacknowledgeAlert(identifier, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);

    return i18nObj.__('forms.unack.response-ack', { alert: alert.tinyId });
}
