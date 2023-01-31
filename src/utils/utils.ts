import queryString, { ParsedQuery, ParsedUrl } from 'query-string';

import GeneralConstants from '../constant/general';
import { Account, AppActingUser, AppCallRequest, AppCallResponse, Channel, Integration, IntegrationType, Integrations, ListIntegrationsParams, Oauth2App, ResponseResultWithData, Subscription, Teams } from '../types';
import { AppsOpsGenie, ExceptionType, Routes } from '../constant';
import { KVStoreOptions } from '../clients/kvstore';

import config from '../config';

import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';

import { MattermostClient } from '../clients/mattermost';

import { getAllTeamsCall } from '../forms/list-team';

import { Exception } from './exception';
import { newErrorCallResponseWithMessage, newOKCallResponseWithMarkdown } from './call-responses';

import { hyperlink } from './markdown';
import { getOpsGenieAPIKey } from './user-mapping';
import { configureI18n } from './translations';

export function replace(value: string, searchValue: string, replaceValue: string): string {
    return value.replace(searchValue, replaceValue);
}

export function isConfigured(oauth2: any): boolean {
    return Boolean(oauth2.client_id && oauth2.client_secret);
}

export function isUserSystemAdmin(actingUser: AppActingUser | undefined): boolean {
    return Boolean(actingUser?.roles && actingUser?.roles?.includes(GeneralConstants.SYSTEM_ADMIN_ROLE));
}

export function existsOpsGenieAPIKey(oauth2App: Oauth2App): boolean {
    return Boolean(oauth2App.client_id);
}

export function getAlertDetailUrl(accountName: string, alertId: string): string {
    const url = `${AppsOpsGenie}${Routes.OpsGenieWeb.AlertDetailPathPrefix}`;
    return replace(
        replace(
            url,
            Routes.PathsVariable.Account,
            accountName
        ),
        Routes.PathsVariable.Identifier,
        alertId
    );
}

export function errorDataMessage(error: Exception | Error | any): string {
    const errorMessage: string = error?.data?.message || error?.response?.data?.message || error?.message || error;
    return `${errorMessage}`;
}

export function tryPromise<T>(p: Promise<any>, exceptionType: ExceptionType, message: string, mattermostUrl: string | undefined, requestPath: string | undefined) {
    return p.
        then((response) => {
            return <T>response.data;
        }).
        catch((error) => {
            const errorMessage: string = errorDataMessage(error);
            throw new Exception(exceptionType, `${message} ${errorMessage}`, mattermostUrl, requestPath);
        });
}

export function showMessageToMattermost(exception: Exception | Error): AppCallResponse {
    if (!(exception instanceof Exception)) {
        return newErrorCallResponseWithMessage(exception.message);
    }

    switch (exception.type) {
    case ExceptionType.TEXT_ERROR: return newErrorCallResponseWithMessage(exception.message);
    case ExceptionType.MARKDOWN: return newOKCallResponseWithMarkdown(exception.message);
    default: return newErrorCallResponseWithMessage(exception.message);
    }
}

export function getHTTPPath(): string {
    const host: string = config.APP.HOST;
    const ip: string = host.replace(/^(http:\/\/|https:\/\/|)/g, '');

    if ((/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/).test(ip)) {
        return `${config.APP.HOST}:${config.APP.PORT}`;
    }

    return config.APP.HOST;
}

export const getAlertLink = async (alertTinyId: string, alertID: string, opsGenieClient: OpsGenieClient, mattermostUrl: string | undefined, requestPath: string | undefined) => {
    const account: Account = await tryPromise<Account>(opsGenieClient.getAccount(), ExceptionType.MARKDOWN, 'OpsGenie failed', mattermostUrl, requestPath);
    const url = `${AppsOpsGenie}${Routes.OpsGenieWeb.AlertDetailPathPrefix}`;

    const alertDetailUrl = replace(
        replace(
            url,
            Routes.PathsVariable.Account,
            account.name
        ),
        Routes.PathsVariable.Identifier,
        alertID
    );
    return `${hyperlink(`#${alertTinyId}`, alertDetailUrl)}`;
};

export const getIntegrationsList = async (call: AppCallRequest) => {
    const mattermostUrl: string = call.context.mattermost_site_url!;
    const accessToken: string = call.context.acting_user_access_token!;
    const i18nObj = configureI18n(call.context);
    const apiKey = getOpsGenieAPIKey(call);

    const options: KVStoreOptions = {
        mattermostUrl,
        accessToken,
    };

    const optionsOps: OpsGenieOptions = {
        api_key: apiKey,
    };
    const opsGenieClient: OpsGenieClient = new OpsGenieClient(optionsOps);

    const integrationParams: ListIntegrationsParams = {
        type: IntegrationType.WEBHOOK,
    };
    const integrationsResult: Integrations[] = await tryPromise<Integrations[]>(opsGenieClient.listIntegrations(integrationParams), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);

    const teams: Teams[] = await getAllTeamsCall(call);
    const teamsIds: string[] = teams.map((team) => team.id);
    const mattermostClient: MattermostClient = new MattermostClient(options);

    const promises: Promise<Subscription | undefined>[] = integrationsResult.map(async (int: Integrations) => {
        if (!teamsIds.includes(int.teamId)) {
            return Promise.resolve(undefined);
        }

        const integration: Integration = await tryPromise<Integration>(opsGenieClient.getIntegration(int.id), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);

        const queryParams: ParsedUrl = queryString.parseUrl(integration.url);
        const params: ParsedQuery = queryParams.query;

        try {
            const channel: Channel = await mattermostClient.getChannel(<string>params.channelId);
            return new Promise((resolve, reject) => {
                resolve({
                    integrationId: int.id,
                    ...integration,
                    channelId: channel.id,
                    channelName: channel.name,
                } as Subscription);
            });
        } catch (error) {
            return Promise.resolve(undefined);
        }
    });

    const integrations: Subscription[] = webhookSubscriptionArray(await Promise.all(promises));
    return integrations;
};

export function webhookSubscriptionArray(array: (Subscription | undefined)[]): Subscription[] {
    return array.filter((el): el is Subscription => typeof (el) !== 'undefined');
}

export function routesJoin(routes: Array<string>) {
    return ''.concat(...routes);
}