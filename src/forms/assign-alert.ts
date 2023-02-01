import {
    Alert,
    AlertAssign,
    AppCallAction,
    AppCallRequest,
    AppCallValues,
    AppContextAction,
    Identifier,
    IdentifierType,
    User,
} from '../types';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { AssignAlertForm, ExceptionType } from '../constant';
import { configureI18n } from '../utils/translations';
import { getAlertLink, tryPromise } from '../utils/utils';
import { canUserInteractWithAlert, getOpsGenieAPIKey } from '../utils/user-mapping';
import { Exception } from '../utils/exception';

export async function assignAlertCall(call: AppCallRequest): Promise<string> {
    const accessToken: string | undefined = call.context.acting_user_access_token;
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const username: string | undefined = call.context.acting_user?.username;
    const values: AppCallValues | undefined = call.values;
    const i18nObj = configureI18n(call.context);
    const apiKey = getOpsGenieAPIKey(call);

    if (!values) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('general.validation-form.values-not-found'), call.context.mattermost_site_url, call.context.app_path);
    }

    const userId: string = values?.[AssignAlertForm.USER_ID].value;
    const alertTinyId: string = values?.[AssignAlertForm.NOTE_TINY_ID];

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: apiKey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    const mattermostUser: User = await mattermostClient.getUser(userId);

    const identifierUser: Identifier = {
        identifier: mattermostUser.email,
        identifierType: IdentifierType.USERNAME,
    };
    await tryPromise(opsGenieClient.getUser(identifierUser), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);

    const identifierAlert: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY,
    };

    const alert: Alert = await canUserInteractWithAlert(call, alertTinyId);
    const alertURL: string = await getAlertLink(alertTinyId, alert.id, opsGenieClient, call.context.mattermost_site_url, call.context.app_path);

    const data: AlertAssign = {
        user: username,
        owner: {
            username: mattermostUser.email,
        },
        note: i18nObj.__('forms.message-note'),
    };

    await tryPromise(opsGenieClient.assignAlert(identifierAlert, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);
    return i18nObj.__('forms.response-assign-alert', { url: alertURL, email: mattermostUser.email });
}

export async function assignAlertAction(call: AppCallAction<AppContextAction>): Promise<string> {
    const accessToken: string | undefined = call.context.acting_user_access_token;
    const mattermostUrl: string = call.context.mattermost_site_url;
    const username: string = call.context.acting_user.username;
    const assignUserSelected: string = call.values.userselectevent?.value;
    const alertTinyId: string = call.state.alert.tinyId as string;
    const i18nObj = configureI18n(call.context);
    const apiKey = getOpsGenieAPIKey(call);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: apiKey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    const mattermostUser: User = await mattermostClient.getUser(<string>assignUserSelected);

    const identifierUser: Identifier = {
        identifier: mattermostUser.email,
        identifierType: IdentifierType.USERNAME,
    };
    await tryPromise(opsGenieClient.getUser(identifierUser), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);

    const identifierAlert: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY,
    };

    const alert: Alert = await canUserInteractWithAlert(call, alertTinyId);
    const alertURL: string = await getAlertLink(alertTinyId, alert.id, opsGenieClient, call.context.mattermost_site_url, call.context.app_path);

    const data: AlertAssign = {
        user: username,
        owner: {
            username: mattermostUser.email,
        },
    };
    await tryPromise(opsGenieClient.assignAlert(identifierAlert, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);

    return i18nObj.__('forms.response-assign-alert', { url: alertURL, email: mattermostUser.email });
}
