import {
    Alert,
    AlertAssign,
    AppActingUser,
    AppCallAction,
    AppCallValues,
    AppContextAction,
    Identifier,
    IdentifierType,
} from '../types';
import { AckAlertForm, ExceptionType } from '../constant';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { configureI18n } from '../utils/translations';
import { getAlertLink, tryPromise } from '../utils/utils';
import { Exception } from '../utils/exception';
import { canUserInteractWithAlert, getOpsGenieAPIKey } from '../utils/user-mapping';

export async function takeOwnershipAlertCall(call: AppCallAction<AppContextAction>): Promise<string> {
    const actingUser: AppActingUser | undefined = call.context.acting_user;
    const username: string = call.context.acting_user.username;
    const values: AppCallValues | undefined = call.values;
    const i18nObj = configureI18n(call.context);
    const alertTinyId: string = typeof values?.[AckAlertForm.NOTE_TINY_ID] === 'undefined' ?
        call.state.alert.tinyId as string :
        values?.[AckAlertForm.NOTE_TINY_ID];
    const apiKey = getOpsGenieAPIKey(call);

    if (!values) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('general.validation-form.values-not-found'), call.context.mattermost_site_url, call.context.app_path);
    }

    const opsGenieOpt: OpsGenieOptions = {
        api_key: apiKey,
    };
    const opsGenieClient = new OpsGenieClient(opsGenieOpt);

    const identifierUser: Identifier = {
        identifier: actingUser.email,
        identifierType: IdentifierType.USERNAME,
    };

    await tryPromise(opsGenieClient.getUser(identifierUser), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);

    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY,
    };
    const alert: Alert = await canUserInteractWithAlert(call, alertTinyId);
    const alertURL: string = await getAlertLink(alertTinyId, alert.id, opsGenieClient, call.context.mattermost_site_url, call.context.app_path);

    if (alert.owner === actingUser.email) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.actions.exception-owner', { alert: alertURL }), call.context.mattermost_site_url, call.context.app_path);
    }

    const data: AlertAssign = {
        user: username,
        owner: {
            username: actingUser.email,
        },
    };

    await tryPromise(opsGenieClient.assignAlert(identifier, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);

    return i18nObj.__('forms.actions.response-owner', { alert: alertURL });
}
