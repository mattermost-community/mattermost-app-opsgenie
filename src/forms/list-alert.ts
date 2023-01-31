import { Account, Alert, AlertStatus, AppActingUser, AppCallRequest, ListAlertParams, Teams } from '../types';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { AppsOpsGenie, ExceptionType, Routes } from '../constant';
import { configureI18n } from '../utils/translations';
import { isUserSystemAdmin, replace, tryPromise } from '../utils/utils';
import { allowMemberAction, getOpsGenieAPIKey, validateUserAccess } from '../utils/user-mapping';
import { h6, hyperlink, joinLines, strikethrough } from '../utils/markdown';
import { Exception } from '../utils/exception';

import { getAllTeamsCall } from './list-team';

export async function getAllAlertCall(call: AppCallRequest): Promise<string> {
    const actingUser: AppActingUser | undefined = call.context.acting_user;
    const isSystemAdmin: boolean = isUserSystemAdmin(actingUser);
    const allowMember: boolean = allowMemberAction(call.context);
    const i18nObj = configureI18n(call.context);
    const apiKey = getOpsGenieAPIKey(call);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: apiKey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const params: ListAlertParams = {
        limit: 100,
    };
    let alerts: Alert[] = await tryPromise<Alert[]>(opsGenieClient.listAlert(params), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);

    if (!allowMember) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('general.validation-user.genie-action-invalid'), call.context.mattermost_site_url, call.context.app_path);
    }

    if (!isSystemAdmin) {
        const teams: Teams[] = await getAllTeamsCall(call);
        const teamsIds: string[] = teams.map((team) => team.id);
        alerts = alerts.filter((alert: Alert) => teamsIds.includes(alert.ownerTeamId));
    }

    const account: Account = await tryPromise<Account>(opsGenieClient.getAccount(), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);

    const alertsWithStatusOpen: Alert[] = alerts.filter((alert: Alert) => alert.status === AlertStatus.OPEN);
    const alertsUnacked: number = alertsWithStatusOpen.filter((alert: Alert) => !alert.acknowledged).length;
    const url = `${AppsOpsGenie}${Routes.OpsGenieWeb.AlertDetailPathPrefix}`;

    const teamsText: string = [
        h6(i18nObj.__('api.list-alert.message', { alerts: alertsUnacked.toString(), openalert: alertsWithStatusOpen.length.toString(), length: alerts.length.toString() })),
        `${joinLines(
            alerts.map((alert: Alert) => {
                const alertDetailUrl: string = replace(
                    replace(
                        url,
                        Routes.PathsVariable.Account,
                        account.name
                    ),
                    Routes.PathsVariable.Identifier,
                    alert.id
                );

                return i18nObj.__('api.list-alert.list-item', {
                    tinyId: alert.tinyId,
                    message: alert.message,
                    status: alert.status,
                    link: hyperlink(i18nObj.__('api.list-alert.detail'), alertDetailUrl),
                });
            }).join('\n')
        )}\n`,
    ].join('');

    return teamsText;
}
