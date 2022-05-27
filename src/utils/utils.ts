import GeneralConstants from '../constant/general';
import {UserProfile} from '../types';

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

export function isUserSystemAdmin(actingUser: UserProfile): boolean {
    return Boolean(actingUser.roles && actingUser.roles.includes(GeneralConstants.SYSTEM_ADMIN_ROLE));
}

export function isConnected(oauth2user: any): boolean {
    return !!oauth2user?.token?.access_token;
}
