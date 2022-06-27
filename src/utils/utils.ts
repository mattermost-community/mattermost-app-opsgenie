import GeneralConstants from '../constant/general';
import {AppActingUser, UserProfile} from '../types';
import {AppsOpsGenie, Routes, StoreKeys} from '../constant';
import {ConfigStoreProps, KVStoreClient} from "../clients/kvstore";

export function replace(value: string, searchValue: string, replaceValue: string): string {
    return value.replace(searchValue, replaceValue);
}

export function errorWithMessage(error: Error, message: string): string {
    return `"${message}".  ${error.message}`;
}

export function errorOpsgenieWithMessage(error: Error|any, message: string): string {
    const errorMessage: string = error?.data?.message || error.message;
    return `"${message}".  ${errorMessage}`;
}

export async function tryPromiseWithMessage(p: Promise<any>, message: string): Promise<any> {
    return p.catch((error) => {
        console.log('error', error);
        throw new Error(errorWithMessage(error, message));
    });
}

export async function tryPromiseOpsgenieWithMessage(p: Promise<any>, message: string): Promise<any> {
    return p.catch((error) => {
        console.log('error', error);
        throw new Error(errorOpsgenieWithMessage(error.response, message));
    });
}

export function isConfigured(oauth2: any): boolean {
    return Boolean(oauth2.client_id && oauth2.client_secret);
}

export function isUserSystemAdmin(actingUser: AppActingUser): boolean {
    return Boolean(actingUser.roles && actingUser.roles.includes(GeneralConstants.SYSTEM_ADMIN_ROLE));
}

export async function existsKvOpsGenieConfig(kvClient: KVStoreClient): Promise<boolean> {
    const trelloConfig: ConfigStoreProps = await kvClient.kvGet(StoreKeys.config);

    return Boolean(Object.keys(trelloConfig).length);
}

export function isConnected(oauth2user: any): boolean {
    return !!oauth2user?.token?.access_token;
}

export function getAlertDetailUrl(accountName: string, alertId: string): string {
    const url: string = `${AppsOpsGenie}${Routes.OpsGenieWeb.AlertDetailPathPrefix}`;
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
