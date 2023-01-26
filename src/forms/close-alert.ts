import * as _ from 'lodash';

import {
    Alert,
    AlertClose,
    AlertStatus,
    AppCallAction,
    AppCallRequest,
    AppCallValues,
    AppContext,
    AppContextAction,
    AppForm,
    Identifier,
    IdentifierType,
    PostResponse,
    PostUpdate,
} from '../types';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { AckAlertForm, AppExpandLevels, ExceptionType, OpsGenieIcon, Routes } from '../constant';
import { configureI18n } from '../utils/translations';
import { getAlertLink, tryPromise } from '../utils/utils';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';
import { Exception } from '../utils/exception';
import { h6 } from '../utils/markdown';
import { canUserInteractWithAlert, ExtendRequired, getOpsGenieAPIKey } from '../utils/user-mapping';

export async function closeAlertCall(call: AppCallRequest): Promise<string> {
    const username: string | undefined = call.context.acting_user?.username;
    const values: AppCallValues | undefined = call.values;
    const i18nObj = configureI18n(call.context);
    const apiKey = getOpsGenieAPIKey(call);

    const alertTinyId: string = typeof values?.[AckAlertForm.NOTE_TINY_ID] === 'undefined' ?
        call.state.alert.tinyId as string :
        values?.[AckAlertForm.NOTE_TINY_ID];

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: apiKey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY,
    };
    
    const alert: Alert = await canUserInteractWithAlert(call, alertTinyId);
    const alertURL: string = await getAlertLink(alertTinyId, alert.id, opsGenieClient);

    if (alert.status === AlertStatus.CLOSED) {
        await updatePostCloseAlert(call.context, alert);
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.close-alert.error-close-alert', { url: alertURL }),);
    }

    const data: AlertClose = {
        user: username,
    };
    await tryPromise(opsGenieClient.closeAlert(identifier, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));

    await updatePostCloseAlert(call.context, alert);

    return i18nObj.__('forms.close-alert.response-close-alert', { url: alertURL });
}

export async function closeAlertForm(call: AppCallAction<AppContextAction>): Promise<AppForm> {
    const i18nObj = configureI18n(call.context);
    const values: AppCallValues | undefined = call.values;
    const alertTinyId: string = typeof values?.[AckAlertForm.NOTE_TINY_ID] === 'undefined' ?
        call.state.alert.tinyId as string :
        values?.[AckAlertForm.NOTE_TINY_ID];

    const apiKey = getOpsGenieAPIKey(call);
    const optionsOpsgenie: OpsGenieOptions = {
        api_key: apiKey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const alert: Alert = await canUserInteractWithAlert(call, alertTinyId);
    const alertURL: string = await getAlertLink(<string>alert.tinyId, alert.id, opsGenieClient);

    if (alert.status === AlertStatus.CLOSED) {
        await updatePostCloseAlert(call.context, alert);
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.close-alert.error-close-alert', { url: alertURL }),);
    }

    const stateAlert = {
        id: alert.id,
        message: alert.message,
        tinyId: alert.tinyId,
    };

    const form: AppForm = {
        title: i18nObj.__('forms.close-alert.ask-close-alert-title', { alert: alert.tinyId }),
        header: i18nObj.__('forms.close-alert.ask-close-alert-header', { url: alertURL }),
        icon: OpsGenieIcon,
        fields: [],
        submit: {
            path: Routes.App.CallPathAlertCloseSubmit,
            expand: {
                ...ExtendRequired,
                post: AppExpandLevels.EXPAND_SUMMARY,
            },
            state: {
                alert: stateAlert,
            },
        },
    };
    return form;
}

async function updatePostCloseAlert(context: AppContextAction | AppContext, alert: Alert) {
    const i18nObj = configureI18n(context);
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const postId: string | undefined = context.post?.id;

    if (!postId) {
        return;
    }

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    const currentPost = await tryPromise<PostResponse>(mattermostClient.getPost(postId), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));

    const newProps = _.cloneDeep(currentPost.props);
    newProps.app_bindings[0].bindings = [];
    newProps.app_bindings[0].color = '#AD251C';
    newProps.app_bindings[0].description = h6(i18nObj.__('api.webhook.title-closed', { text: `${alert.tinyId}: ${alert.message}`, url: alert.source }));

    const updatePost: PostUpdate = {
        id: postId,
        props: newProps,
    };

    await mattermostClient.updatePost(postId, updatePost);
}
