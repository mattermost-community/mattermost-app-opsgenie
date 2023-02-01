import {
    Alert,
    AppCallRequest,
    AppCallValues,
    Identifier,
    IdentifierType,
    PriorityAlert,
} from '../types';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { ExceptionType, PriorityAlertForm } from '../constant';
import { configureI18n } from '../utils/translations';
import { getAlertLink, tryPromise } from '../utils/utils';
import { Exception } from '../utils/exception';
import { canUserInteractWithAlert, getOpsGenieAPIKey } from '../utils/user-mapping';

export async function priorityAlertCall(call: AppCallRequest): Promise<string> {
    const username: string | undefined = call.context.acting_user?.username;
    const values: AppCallValues | undefined = call.values;
    const i18nObj = configureI18n(call.context);
    const apiKey = getOpsGenieAPIKey(call);

    if (!values) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('general.validation-form.values-not-found'), call.context.mattermost_site_url, call.context.app_path);
    }

    const alertTinyId: string = values?.[PriorityAlertForm.NOTE_TINY_ID];
    const priority: string = values?.[PriorityAlertForm.ALERT_PRIORITY]?.value;

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

    if (alert.priority === priority) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.priority.exception', { url: alertURL, priority }), call.context.mattermost_site_url, call.context.app_path);
    }

    const priorityAlert: PriorityAlert = {
        priority,
        user: username,
    };
    await tryPromise(opsGenieClient.updatePriorityToAlert(identifier, priorityAlert), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);
    return i18nObj.__('forms.priority.response', { url: alertURL, priority });
}
