// @ts-ignore
import * as opsgenie from 'opsgenie-sdk';
import config from '../config';
import {AlertCreate, NoteToAlertCreate, AlertIdentifier, ResponseResult} from '../types';

export interface OpsGenieClient {
    version: string;
    configure: Function;
    headers: Function;
    configuration: {
        mode: string;
        host: string;
        maxAttempts: number;
        retryDelay: number;
        retryStrategy: Function;
        api_key: string;
    },
    alertV2: {
        create: (data: AlertCreate, handlerResponse: Function) => ResponseResult;
        addNote: (identifier: AlertIdentifier, data: NoteToAlertCreate, handlerResponse: Function) => ResponseResult;
        snooze: (identifier: AlertIdentifier, data: NoteToAlertCreate, handlerResponse: Function) => ResponseResult;
    }
}

export type OpsGenieClientOptions = {
    oauth2UserAccessToken: string;
}

export type ClientOptions = {
    api_key: string;
    host: string;
}

export const newOpsgenieClient = async (opsgenieOptions: OpsGenieClientOptions): Promise<OpsGenieClient> => {
    const token = config.OPSGENIE.API_KEY;
    if (!token) {
        throw new Error('Failed to get oauth2 user access_token');
    }

    const host: string = config.OPSGENIE.URL;
    const options: ClientOptions = {
        api_key: token,
        host
    };

    opsgenie.configure(options);
    return opsgenie as OpsGenieClient;
};
