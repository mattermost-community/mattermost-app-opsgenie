import { AppActingUser, AppCallRequest, Oauth2App, OpsUser, Teams } from '../types';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { ExceptionType } from '../constant';
import { configureI18n } from '../utils/translations';
import { isUserSystemAdmin, tryPromise } from '../utils/utils';
import { allowMemberAction, getOpsGenieAPIKey, linkEmailAddress, validateUserAccess } from '../utils/user-mapping';

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

    if (isSystemAdmin) {
        return await tryPromise<Teams[]>(opsGenieClient.getAllTeams(), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
    } 

    if (allowMember) {
        const genieUser: OpsUser = await validateUserAccess(call);
        return await tryPromise<Teams[]>(opsGenieClient.getAllUserTeams(genieUser.username), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
    } 

    return [];
}
