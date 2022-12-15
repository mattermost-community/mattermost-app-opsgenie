import axios from 'axios';

import config from '../config';
import {
    Account,
    ActionResponse,
    Alert,
    AlertAck,
    AlertAssign,
    AlertClose,
    AlertCreate,
    AlertNote,
    AlertSnooze,
    AlertUnack,
    Identifier,
    Integration,
    IntegrationCreate,
    Integrations,
    ListAlertParams,
    ListIntegrationsParams,
    OpsUser,
    PriorityAlert,
    ResponseResult,
    ResponseResultWithData,
    Team,
    Teams,
} from '../types';
import { Routes } from '../constant';
import { replace } from '../utils/utils';

export type OpsGenieOptions = {
    api_key: string;
}

export class OpsGenieClient {
    private readonly options: OpsGenieOptions | undefined;

    constructor(
        options: OpsGenieOptions
    ) {
        this.options = options;
    }

    public getAccount(): Promise<ResponseResultWithData<Account>> {
        const url = `${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${Routes.OpsGenie.AccountPathPrefix}`;
        return axios.get(url, {
            headers: {
                Authorization: `GenieKey ${this.options?.api_key}`,
            },
            responseType: 'json',
        }).then((response) => response.data);
    }

    public listIntegrations(params?: ListIntegrationsParams): Promise<ResponseResultWithData<Integrations[]>> {
        const url = `${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${Routes.OpsGenie.IntegrationPathPrefix}`;
        return axios.get(url, {
            headers: {
                Authorization: `GenieKey ${this.options?.api_key}`,
            },
            params,
            responseType: 'json',
        }).then((response) => response.data);
    }

    public getIntegration(integrationId: string): Promise<ResponseResultWithData<Integration>> {
        const url = `${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${Routes.OpsGenie.GetIntegrationPathPrefix}`;
        return axios.get(replace(url, Routes.PathsVariable.Identifier, integrationId), {
            headers: {
                Authorization: `GenieKey ${this.options?.api_key}`,
            },
            responseType: 'json',
        }).then((response) => response.data);
    }

    public deleteIntegration(integrationId: string): Promise<ResponseResult> {
        const url = `${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${Routes.OpsGenie.DeleteIntegrationPathPrefix}`;
        return axios.delete(replace(url, Routes.PathsVariable.Identifier, integrationId), {
            headers: {
                Authorization: `GenieKey ${this.options?.api_key}`,
            },
            responseType: 'json',
        }).then((response) => response.data);
    }

    public createIntegration(data: IntegrationCreate): Promise<ResponseResultWithData<ActionResponse>> {
        const url = `${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${Routes.OpsGenie.IntegrationPathPrefix}`;
        return axios.post(url, data, {
            headers: {
                Authorization: `GenieKey ${this.options?.api_key}`,
            },
            responseType: 'json',
        }).then((response) => response.data);
    }

    public createAlert(alert: AlertCreate): Promise<ResponseResult> {
        const url = `${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${Routes.OpsGenie.AlertPathPrefix}`;
        return axios.post(url, alert, {
            headers: {
                Authorization: `GenieKey ${this.options?.api_key}`,
            },
            responseType: 'json',
        }).then((response) => response.data);
    }

    public updatePriorityToAlert(identifier: Identifier, alert: PriorityAlert): Promise<ResponseResult> {
        const url = `${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${Routes.OpsGenie.UpdatePriorityToAlertPathPrefix}`;
        return axios.put(replace(url, Routes.PathsVariable.Identifier, identifier.identifier), alert, {
            headers: {
                Authorization: `GenieKey ${this.options?.api_key}`,
            },
            params: {
                identifierType: identifier.identifierType,
            },
            responseType: 'json',
        }).then((response) => response.data);
    }

    public addNoteToAlert(identifier: Identifier, data: AlertNote): Promise<ResponseResult> {
        const url = `${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${Routes.OpsGenie.NoteToAlertPathPrefix}`;
        return axios.post(replace(url, Routes.PathsVariable.Identifier, identifier.identifier), data, {
            headers: {
                Authorization: `GenieKey ${this.options?.api_key}`,
            },
            params: {
                identifierType: identifier.identifierType,
            },
            responseType: 'json',
        }).then((response) => response.data);
    }

    public listAlert(params: ListAlertParams): Promise<ResponseResultWithData<Alert[]>> {
        const url = `${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${Routes.OpsGenie.AlertPathPrefix}`;
        return axios.get(url, {
            headers: {
                Authorization: `GenieKey ${this.options?.api_key}`,
            },
            params,
            responseType: 'json',
        }).then((response) => response.data);
    }

    public getAlert(identifier: Identifier): Promise<ResponseResultWithData<Alert>> {
        return axios.get(`${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${Routes.OpsGenie.AlertPathPrefix}/${identifier.identifier}`, {
            headers: {
                Authorization: `GenieKey ${this.options?.api_key}`,
            },
            params: {
                identifierType: identifier.identifierType,
            },
            responseType: 'json',
        }).then((response) => response.data);
    }

    public closeAlert(identifier: Identifier, data?: AlertClose): Promise<ResponseResult> {
        const path = `${replace(Routes.OpsGenie.CloseAlertPathPrefix, Routes.PathsVariable.Identifier, identifier.identifier)}`;
        const url = `${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${path}`;
        return axios.post(url, data, {
            headers: {
                Authorization: `GenieKey ${this.options?.api_key}`,
            },
            params: {
                identifierType: identifier.identifierType,
            },
            responseType: 'json',
        }).then((response) => response.data);
    }

    public unacknowledgeAlert(identifier: Identifier, data?: AlertUnack): Promise<ResponseResult> {
        const path = `${replace(Routes.OpsGenie.UnacknowledgeAlertPathPrefix, Routes.PathsVariable.Identifier, identifier.identifier)}`;
        const url = `${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${path}`;
        return axios.post(url, data, {
            headers: {
                Authorization: `GenieKey ${this.options?.api_key}`,
            },
            params: {
                identifierType: identifier.identifierType,
            },
            responseType: 'json',
        }).then((response) => response.data);
    }

    public acknowledgeAlert(identifier: Identifier, data?: AlertAck): Promise<ResponseResult> {
        const path = `${replace(Routes.OpsGenie.AcknowledgeAlertPathPrefix, Routes.PathsVariable.Identifier, identifier.identifier)}`;
        const url = `${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${path}`;
        return axios.post(url, data, {
            headers: {
                Authorization: `GenieKey ${this.options?.api_key}`,
            },
            params: {
                identifierType: identifier.identifierType,
            },
            responseType: 'json',
        }).then((response) => response.data);
    }

    public snoozeAlert(identifier: Identifier, data: AlertSnooze): Promise<ResponseResult> {
        const path = `${replace(Routes.OpsGenie.SnoozeAlertPathPrefix, Routes.PathsVariable.Identifier, identifier.identifier)}`;
        const url = `${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${path}`;
        return axios.post(url, data, {
            headers: {
                Authorization: `GenieKey ${this.options?.api_key}`,
            },
            params: {
                identifierType: identifier.identifierType,
            },
            responseType: 'json',
        }).then((response) => response.data);
    }

    public assignAlert(identifier: Identifier, data: AlertAssign): Promise<ResponseResult> {
        const path = `${replace(Routes.OpsGenie.AssignAlertPathPrefix, Routes.PathsVariable.Identifier, identifier.identifier)}`;
        const url = `${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${path}`;
        return axios.post(url, data, {
            headers: {
                Authorization: `GenieKey ${this.options?.api_key}`,
            },
            params: {
                identifierType: identifier.identifierType,
            },
            responseType: 'json',
        }).then((response) => response.data);
    }

    public getUser(identifier: Identifier): Promise<ResponseResultWithData<OpsUser>> {
        const path = `${replace(Routes.OpsGenie.UserPathPrefix, Routes.PathsVariable.Identifier, identifier.identifier)}`;
        const url = `${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${path}`;
        return axios.get(url, {
            headers: {
                Authorization: `GenieKey ${this.options?.api_key}`,
            },
            params: {
                identifierType: identifier.identifierType,
            },
            responseType: 'json',
        }).then((response) => response.data);
    }

    public getTeam(identifier: Identifier): Promise<ResponseResultWithData<Team>> {
        return axios.get(`${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${Routes.OpsGenie.TeamPathPrefix}/${identifier.identifier}`, {
            headers: {
                Authorization: `GenieKey ${this.options?.api_key}`,
            },
            params: {
                identifierType: identifier.identifierType,
            },
            responseType: 'json',
        }).then((response) => response.data);
    }

    public getAllTeams(): Promise<ResponseResultWithData<Teams[]>> {
        const url = `${config.OPSGENIE.URL}${Routes.OpsGenie.APIVersionV2}${Routes.OpsGenie.TeamPathPrefix}`;
        return axios.get(url, {
            headers: {
                Authorization: `GenieKey ${this.options?.api_key}`,
            },
            responseType: 'json',
        }).then((response) => response.data);
    }
}
