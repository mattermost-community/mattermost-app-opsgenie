import {Request, Response} from 'express';
import {Alert, AlertStatus, AppCallResponse} from '../types';
import {
    newOKCallResponse,
    newOKCallResponseWithMarkdown
} from '../utils/call-responses';
import {createAlertCall} from '../forms/create-alert';
import {addNoteToAlertCall} from '../forms/create-note';
import {createSnoozeAlertCall} from '../forms/create-snooze';
import {assignAlertCall} from '../forms/assign-alert';
import {closeAlertCall} from '../forms/close-alert';
import {ackAlertCall} from '../forms/ack-alert';
import {otherActionsAlertCall} from '../forms/other-actions-alert';
import {closeActionsAlertCall} from '../forms/close-actions-alert';
import {unackAlertCall} from '../forms/unack-alert';
import {getAllAlertCall} from '../forms/list-alert';
import {takeOwnershipAlertCall} from '../forms/take-ownership-alert';
import {h6, hyperlink, joinLines} from '../utils/markdown';
import {AppsOpsGenie, Routes} from '../constant';
import {replace, showMessageToMattermost} from '../utils/utils';
import {priorityAlertCall} from '../forms/priority-alert';

export const listAlertsSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const [alerts, account] = await getAllAlertCall(request.body);

        const alertsWithStatusOpen: number = alerts.filter((alert: Alert) => alert.status === AlertStatus.OPEN).length;
        const alertsUnacked: number = alerts.filter((alert: Alert) => !alert.acknowledged).length;
        const url: string = `${AppsOpsGenie}${Routes.OpsGenieWeb.AlertDetailPathPrefix}`;

        const teamsText: string = [
            h6(`Alert List: Found ${alertsUnacked} unacked alerts out of ${alertsWithStatusOpen} open alerts.`),
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
                    const status: string = alert.acknowledged ? 'acked' : 'unacked';
                    return `- #${alert.tinyId}: "${alert.message}" [${status}] - ${hyperlink('View details', alertDetailUrl)}.`;
                }).join('\n')
            )}\n`
        ].join('');
        callResponse = newOKCallResponseWithMarkdown(teamsText);
        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const createAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await createAlertCall(request.body);
        callResponse = newOKCallResponseWithMarkdown("Alert will be created");
        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const closeAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await closeAlertCall(request.body);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const ackAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await ackAlertCall(request.body);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const unackAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await unackAlertCall(request.body);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const otherActionsAlert = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await otherActionsAlertCall(request.body);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const closeActionsAlert = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await closeActionsAlertCall(request.body);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const addNoteToAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await addNoteToAlertCall(request.body);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
}

export const assignAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await assignAlertCall(request.body);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const snoozeAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await createSnoozeAlertCall(request.body);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const takeOwnershipAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await takeOwnershipAlertCall(request.body);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const priorityAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await priorityAlertCall(request.body);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

