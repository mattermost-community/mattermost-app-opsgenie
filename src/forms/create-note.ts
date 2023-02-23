import {
    Alert,
    AlertNote,
    AppCallAction,
    AppCallRequest,
    AppCallValues,
    AppContextAction,
    Identifier,
    IdentifierType,
    ResponseResult,
} from '../types';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { ExceptionType, NoteCreateForm } from '../constant';
import { configureI18n } from '../utils/translations';
import { getAlertLink, tryPromise } from '../utils/utils';
import { canUserInteractWithAlert, getOpsGenieAPIKey } from '../utils/user-mapping';
import { Exception } from '../utils/exception';

export async function addNoteToAlertCall(call: AppCallRequest): Promise<string> {
    const username: string | undefined = call.context.acting_user?.username;
    const values: AppCallValues | undefined = call.values;
    const apiKey = getOpsGenieAPIKey(call);
    const i18nObj = configureI18n(call.context);

    if (!values) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('general.validation-form.values-not-found'), call.context.mattermost_site_url, call.context.app_path);
    }

    const alertMessage: string = values?.[NoteCreateForm.NOTE_MESSAGE];
    const alertTinyId: string = values?.[NoteCreateForm.NOTE_TINY_ID];

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: apiKey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const alertResponse: Alert = await canUserInteractWithAlert(call, alertTinyId);
    const alertURL: string = await getAlertLink(alertTinyId, alertResponse.id, opsGenieClient, call.context.mattermost_site_url, call.context.app_path);

    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY,
    };

    const data: AlertNote = {
        note: alertMessage,
        user: username,
    };

    await tryPromise<ResponseResult>(opsGenieClient.addNoteToAlert(identifier, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);
    return i18nObj.__('forms.create-alert.response', { url: alertURL });
}

export async function addNoteToAlertAction(call: AppCallAction<AppContextAction>): Promise<string> {
    const i18nObj = configureI18n(call.context);
    const apiKey = getOpsGenieAPIKey(call);

    const alertMessage: string = call.values.alert_message;
    const alertTinyId: string = call.state.alert.tinyId as string;

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: apiKey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY,
    };
    const alert: Alert = await canUserInteractWithAlert(call, alertTinyId);
    const alertURL: string = await getAlertLink(alertTinyId, alert.id, opsGenieClient, call.context.mattermost_site_url, call.context.app_path);

    const data: AlertNote = {
        note: alertMessage,
    };
    await tryPromise(opsGenieClient.addNoteToAlert(identifier, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);
    return i18nObj.__('forms.create-alert.response', { url: alertURL });
}
