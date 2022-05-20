// @ts-ignore
import * as opsgenie from 'opsgenie-sdk';
import axios from 'axios';
import config from '../config';
import {
    AlertCreate,
    NoteToAlertCreate,
    ResponseResult,
    SnoozeAlertCreate,
    AssignOwnerToAlertCreate,
    ListAlertParams,
    ResponseResultWithData,
    Alert,
    Team,
    Identifier
} from '../types';
import {Routes} from '../constant';
import {replace} from "../utils/utils";

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
        list: (params: ListAlertParams, handlerResponse: Function) => ResponseResultWithData<Alert>;
        addNote: (identifier: Identifier, data: NoteToAlertCreate, handlerResponse: Function) => ResponseResult;
        snooze: (identifier: Identifier, data: SnoozeAlertCreate, handlerResponse: Function) => ResponseResult;
        assign: (identifier: Identifier, data: AssignOwnerToAlertCreate, handlerResponse: Function) => ResponseResult;
    },
    team: {
        list: (identifier: Identifier, handlerResponse: Function) => ResponseResult;
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

export class OpsGenieClient {
    private opsgenieclient: any = opsgenie;
    private options: ClientOptions;

    constructor(opsgenieOptions: OpsGenieClientOptions) {
        const token = config.OPSGENIE.API_KEY;
        if (!token) {
            throw new Error('Failed to get oauth2 user access_token');
        }

        const host: string = config.OPSGENIE.URL;
        const options: ClientOptions = {
            api_key: token,
            host
        };
        this.options = options;

        this.opsgenieclient.configure(options);
    }

    public createAlert(alert: AlertCreate): Promise<ResponseResult> {
        const url: string = `${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${Routes.OpsGenie.AlertPathPrefix}`;
        return axios.post(url, alert,{
            headers: {
                Authorization: `GenieKey ${this.options.api_key}`
            },
            responseType: 'json'
        }).then((response) => response.data);
    }


    public listAlert(params: ListAlertParams): Promise<ResponseResultWithData<Alert[]>> {
        const url: string = `${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${Routes.OpsGenie.AlertPathPrefix}`;
        return axios.get(url, {
            headers: {
                Authorization: `GenieKey ${this.options.api_key}`
            },
            params,
            responseType: 'json'
        }).then((response) => response.data);
    }

    public getAlert(identifier: Identifier): Promise<ResponseResultWithData<Alert>> {
        return axios.get(`${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${Routes.OpsGenie.AlertPathPrefix}/${identifier.identifier}`, {
            headers: {
                Authorization: `GenieKey ${this.options.api_key}`
            },
            params: {
                identifierType: identifier.identifierType
            },
            responseType: 'json'
        }).then((response) => response.data);
    }

    public closeAlert(identifier: Identifier): Promise<ResponseResult> {
        const path: string = `${replace(Routes.OpsGenie.CloseAlertPathPrefix, ':IDENTIFIER', identifier.identifier)}`;
        const url: string = `${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${path}`;
        return axios.post(url, {}, {
            headers: {
                Authorization: `GenieKey ${this.options.api_key}`
            },
            params: {
                identifierType: identifier.identifierType
            },
            responseType: 'json'
        }).then((response) => response.data);
    }

    public unacknowledgeAlert(identifier: Identifier): Promise<ResponseResult> {
        const path: string = `${replace(Routes.OpsGenie.UnacknowledgeAlertPathPrefix, ':IDENTIFIER', identifier.identifier)}`;
        const url: string = `${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${path}`;
        return axios.post(url, {}, {
            headers: {
                Authorization: `GenieKey ${this.options.api_key}`
            },
            params: {
                identifierType: identifier.identifierType
            },
            responseType: 'json'
        }).then((response) => response.data);
    }

    public acknowledgeAlert(identifier: Identifier): Promise<ResponseResult> {
        const path: string = `${replace(Routes.OpsGenie.AcknowledgeAlertPathPrefix, ':IDENTIFIER', identifier.identifier)}`;
        const url: string = `${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${path}`;
        return axios.post(url, {}, {
            headers: {
                Authorization: `GenieKey ${this.options.api_key}`
            },
            params: {
                identifierType: identifier.identifierType
            },
            responseType: 'json'
        }).then((response) => response.data);
    }

    public getTeam(identifier: Identifier): Promise<ResponseResultWithData<Team>> {
        return axios.get(`${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${Routes.OpsGenie.TeamPathPrefix}/${identifier.identifier}`, {
            headers: {
                Authorization: `GenieKey ${this.options.api_key}`
            },
            params: {
                identifierType: identifier.identifierType
            },
            responseType: 'json'
        }).then((response) => response.data);
    }
}
