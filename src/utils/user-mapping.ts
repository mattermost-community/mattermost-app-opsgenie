import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { AppExpandLevels, ExceptionType } from '../constant';
import { Alert, AppActingUser, AppCallAction, AppCallRequest, AppContext, AppContextAction, Identifier, IdentifierType, Oauth2App, OpsUser, ResponseResultWithData, Team } from '../types';

import { Exception } from './exception';
import { configureI18n } from './translations';
import { isUserSystemAdmin, tryPromise } from './utils';

export const ExtendRequired = {
    acting_user: AppExpandLevels.EXPAND_ALL,
    acting_user_access_token: AppExpandLevels.EXPAND_ALL,
    oauth2_app: AppExpandLevels.EXPAND_ALL,
    locale: AppExpandLevels.EXPAND_ALL,
};

export function getOpsGenieAPIKey(call: AppCallRequest | AppCallAction<any>): string {
    const oauth2: Oauth2App = call.context.oauth2 as Oauth2App;
    return oauth2.client_id;
}

export function linkEmailAddress(oauth2App: Oauth2App | undefined): boolean {
    const linkEmail = oauth2App?.data?.settings?.link_email_address;
    return typeof linkEmail === 'boolean' ?
        linkEmail :
        true;
}

export function allowMemberAction(context: AppContext | AppContextAction): boolean {
    const oauth2: Oauth2App | undefined = context.oauth2;
    const actingUser: AppActingUser | undefined = context.acting_user;
    const i18nObj = configureI18n(context);

    if (!actingUser) {
        throw new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.not-provided'), context.mattermost_site_url, context.app_path);
    }

    return isUserSystemAdmin(actingUser) || linkEmailAddress(oauth2);
}

export async function validateUserAccess(call: AppCallRequest): Promise<OpsUser> {
    const actingUser: AppActingUser | undefined = call.context.acting_user;
    const i18nObj = configureI18n(call.context);
    const apiKey = getOpsGenieAPIKey(call);

    if (!actingUser) {
        throw new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.not-provided'), call.context.mattermost_site_url, call.context.app_path);
    }

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: apiKey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const identifierUser: Identifier = {
        identifier: actingUser.email,
        identifierType: IdentifierType.USERNAME,
    };
    const genieUser: OpsUser = await tryPromise<OpsUser>(opsGenieClient.getUser(identifierUser), ExceptionType.MARKDOWN, i18nObj.__('general.validation-user.genie-user', { email: actingUser.email }), call.context.mattermost_site_url, call.context.app_path);

    if (genieUser.blocked) {
        throw new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.genie-user', { email: actingUser.email }), call.context.mattermost_site_url, call.context.app_path);
    }

    if (!genieUser.verified) {
        throw new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.genie-user-verified', { email: actingUser.email }), call.context.mattermost_site_url, call.context.app_path);
    }

    return genieUser;
}

export async function canUserInteractWithAlert(call: AppCallRequest | AppCallAction<AppContextAction>, alertTinyId: string): Promise<Alert> {
    const actingUser: AppActingUser | undefined = call.context.acting_user;
    const isSystemAdmin: boolean = isUserSystemAdmin(actingUser);
    const allowMember: boolean = allowMemberAction(call.context);
    const i18nObj = configureI18n(call.context);
    const apiKey = getOpsGenieAPIKey(call);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: apiKey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY,
    };

    const alertResponse: Alert = await tryPromise<Alert>(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);

    if (!allowMember) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('general.validation-user.genie-action-invalid'), call.context.mattermost_site_url, call.context.app_path);
    }

    if (!isSystemAdmin) {
        const teamIdentifier: Identifier = {
            identifier: alertResponse.ownerTeamId,
            identifierType: IdentifierType.ID,
        };

        const team: Team = await tryPromise<Team>(opsGenieClient.getTeam(teamIdentifier), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);

        const teamMembers: string[] | undefined = team?.members?.map((member) => member.user.username);
        if (!teamMembers || !teamMembers.includes(actingUser?.email || '')) {
            throw new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.genie-alert-not-found', { tinyId: alertTinyId }), call.context.mattermost_site_url, call.context.app_path);
        }
    }

    return alertResponse;
}
