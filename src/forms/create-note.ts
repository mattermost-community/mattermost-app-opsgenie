import {
    Alert,
    AlertNote,
    AppCallAction,
    AppCallRequest,
    AppCallValues,
    AppContextAction,
    Identifier,
    IdentifierType,
    ResponseResultWithData,
} from '../types';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { ExceptionType, NoteCreateForm } from '../constant';
import { configureI18n } from '../utils/translations';
import { getAlertLink, tryPromise } from '../utils/utils';
import { getOpsGenieAPIKey } from '../utils/user-mapping';

export async function addNoteToAlertCall(call: AppCallRequest): Promise<string> {
    const username: string | undefined = call.context.acting_user?.username;
    const values: AppCallValues | undefined = call.values;
    const apiKey = getOpsGenieAPIKey(call);
    const i18nObj = configureI18n(call.context);

    const alertMessage: string = values?.[NoteCreateForm.NOTE_MESSAGE];
    const alertTinyId: string = values?.[NoteCreateForm.NOTE_TINY_ID];

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: apiKey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY,
    };
    const alertResponse: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
    const alertURL: string = await getAlertLink(alertTinyId, alertResponse.data.id, opsGenieClient);

    const data: AlertNote = {
        note: alertMessage,
        user: username,
    };
    await tryPromise(opsGenieClient.addNoteToAlert(identifier, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
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
    const responseAlert: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
    const alertURL: string = await getAlertLink(alertTinyId, responseAlert.data.id, opsGenieClient);

    const data: AlertNote = {
        note: alertMessage,
    };
    await tryPromise(opsGenieClient.addNoteToAlert(identifier, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
    return i18nObj.__('forms.create-alert.response', { url: alertURL });
}
