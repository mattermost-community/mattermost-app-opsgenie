import GeneralConstants from '../constant/general';
import { Account, Alert, AppActingUser, AppCallResponse, Identifier, IdentifierType, ResponseResultWithData } from '../types';
import { AppsOpsGenie, ExceptionType, Routes, StoreKeys } from '../constant';
import { ConfigStoreProps, KVStoreClient } from '../clients/kvstore';

import config from '../config';

import { OpsGenieClient } from '../clients/opsgenie';

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