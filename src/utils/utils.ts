import queryString, { ParsedQuery, ParsedUrl } from 'query-string';

import GeneralConstants from '../constant/general';
import { Account, AppActingUser, AppCallResponse, AppForm, Channel, Integration, IntegrationType, Integrations, ListIntegrationsParams, Oauth2App, ResponseResultWithData, Subscription, AppCallRequest } from '../types';
import { AppsOpsGenie, ExceptionType, Routes, StoreKeys } from '../constant';
import { ConfigStoreProps, KVStoreClient, KVStoreOptions } from '../clients/kvstore';

import config from '../config';

import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';

import { MattermostClient } from '../clients/mattermost';

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

export function isUserSystemAdmin(actingUser: AppActingUser): boolean {
    return Boolean(actingUser.roles && actingUser.roles.includes(GeneralConstants.SYSTEM_ADMIN_ROLE));
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

export function tryPromise(p: Promise<any>, exceptionType: ExceptionType, message: string) {
    return p.catch((error) => {
        const errorMessage: string = errorDataMessage(error);
        throw new Exception(exceptionType, `${message} ${errorMessage}`);
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

export const getAlertLink = async (alertTinyId: string, alertID: string, opsGenieClient: OpsGenieClient) => {
    const account: ResponseResultWithData<Account> = await tryPromise(opsGenieClient.getAccount(), ExceptionType.MARKDOWN, 'OpsGenie failed');
    const url = `${AppsOpsGenie}${Routes.OpsGenieWeb.AlertDetailPathPrefix}`;

    const alertDetailUrl = replace(
        replace(
            url,
            Routes.PathsVariable.Account,
            account.data.name
        ),
        Routes.PathsVariable.Identifier,
        alertID
    );
    return `${hyperlink(`#${alertTinyId}`, alertDetailUrl)}`;
};

export const getIntegrationsList = async (call: AppCallRequest) => {
    const mattermostUrl: string = call.context.mattermost_site_url!;
    const botAccessToken: string = call.context.bot_access_token!;
    const i18nObj = configureI18n(call.context);

    const options: KVStoreOptions = {
        mattermostUrl,
        accessToken: botAccessToken,
    };
    const apiKey = getOpsGenieAPIKey(call);

    const optionsOps: OpsGenieOptions = {
        api_key: apiKey
    };
    const opsGenieClient: OpsGenieClient = new OpsGenieClient(optionsOps);

    const integrationParams: ListIntegrationsParams = {
        type: IntegrationType.WEBHOOK,
    };
    const integrationsResult: ResponseResultWithData<Integrations[]> = await tryPromise(opsGenieClient.listIntegrations(integrationParams), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));

    const mattermostClient: MattermostClient = new MattermostClient(options);

    const promises: Promise<Subscription | undefined>[] = integrationsResult.data.map(async (int: Integrations) => {
        const responseIntegration: ResponseResultWithData<Integration> = await tryPromise(opsGenieClient.getIntegration(int.id), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
        const integration: Integration = responseIntegration.data;

        const queryParams: ParsedUrl = queryString.parseUrl(integration.url);
        const params: ParsedQuery = queryParams.query;
        try {
            const channel: Channel = await mattermostClient.getChannel(<string>params.channelId);
            return new Promise((resolve, reject) => {
                resolve({
                    integrationId: int.id,
                    ...responseIntegration.data,
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
function isType(value: any) {
    var regex = /^[object (S+?)]$/;
    var matches = Object.prototype.toString.call(value).match(regex) || [];

    return (matches[1] || 'undefined').toLowerCase();
}