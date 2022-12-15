import queryString, { ParsedQuery, ParsedUrl } from 'query-string';

import GeneralConstants from '../constant/general';
import { Account, AppActingUser, AppCallResponse, Channel, Integration, IntegrationType, Integrations, ListIntegrationsParams, ResponseResultWithData, Subscription } from '../types';
import { AppsOpsGenie, ExceptionType, Routes, StoreKeys } from '../constant';
import { ConfigStoreProps, KVStoreClient, KVStoreOptions } from '../clients/kvstore';

import config from '../config';

import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';

import { MattermostClient, MattermostOptions } from '../clients/mattermost';

import { Exception } from './exception';
import { newErrorCallResponseWithMessage, newOKCallResponseWithMarkdown } from './call-responses';

import { hyperlink } from './markdown';

export function replace(value: string, searchValue: string, replaceValue: string): string {
    return value.replace(searchValue, replaceValue);
}

export function isConfigured(oauth2: any): boolean {
    return Boolean(oauth2.client_id && oauth2.client_secret);
}

export function isUserSystemAdmin(actingUser: AppActingUser): boolean {
    return Boolean(actingUser.roles && actingUser.roles.includes(GeneralConstants.SYSTEM_ADMIN_ROLE));
}

export async function existsKvOpsGenieConfig(kvClient: KVStoreClient): Promise<boolean> {
    const opsGenieConfig: ConfigStoreProps = await kvClient.kvGet(StoreKeys.config);

    return Boolean(Object.keys(opsGenieConfig).length);
}

export function isConnected(oauth2user: any): boolean {
    return Boolean(oauth2user?.token?.access_token);
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

export const getIntegrationsList = async (options: KVStoreOptions, i18nObj: any) => {
    const kvStore: KVStoreClient = new KVStoreClient(options);

    const configStore: ConfigStoreProps = await kvStore.kvGet(StoreKeys.config);

    const optionsOps: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey,
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