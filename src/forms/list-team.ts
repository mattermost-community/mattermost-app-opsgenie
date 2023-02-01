import { AppActingUser, AppCallRequest, OpsUser, Teams } from '../types';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { ExceptionType } from '../constant';
import { configureI18n } from '../utils/translations';
import { isUserSystemAdmin, tryPromise } from '../utils/utils';
import { allowMemberAction, getOpsGenieAPIKey, validateUserAccess } from '../utils/user-mapping';
import { Exception } from '../utils/exception';

export async function getAllTeamsCall(call: AppCallRequest): Promise<Teams[]> {
    const actingUser: AppActingUser | undefined = call.context.acting_user;
    const isSystemAdmin: boolean = isUserSystemAdmin(actingUser);
    const allowMember: boolean = allowMemberAction(call.context);
    const i18nObj = configureI18n(call.context);
    const apiKey = getOpsGenieAPIKey(call);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: apiKey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    if (!allowMember) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('general.validation-user.genie-action-invalid'), call.context.mattermost_site_url, call.context.app_path);
    }

    if (isSystemAdmin) {
        return tryPromise<Teams[]>(opsGenieClient.getAllTeams(), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);
    }

    const genieUser: OpsUser = await validateUserAccess(call);
    return tryPromise<Teams[]>(opsGenieClient.getAllUserTeams(genieUser.username), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);
}
