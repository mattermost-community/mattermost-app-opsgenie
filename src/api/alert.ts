import { Request, Response } from 'express';

import {
    Alert,
    AlertOption,
    AlertStatus,
    AppCallAction,
    AppCallDialog, AppCallRequest,
    AppCallResponse,
    AppContextAction,
    PostEphemeralCreate,
} from '../types';
import {
    newErrorCallResponseWithMessage,
    newFormCallResponse,
    newOKCallResponse,
    newOKCallResponseWithMarkdown,
} from '../utils/call-responses';
import { createAlertCall } from '../forms/create-alert';
import { addNoteToAlertAction, addNoteToAlertCall } from '../forms/create-note';
import { createSnoozeAlertAction, createSnoozeAlertCall } from '../forms/create-snooze';
import { assignAlertAction, assignAlertCall } from '../forms/assign-alert';
import { closeAlertAction, closeAlertCall } from '../forms/close-alert';
import { ackAlertAction, ackAlertCall } from '../forms/ack-alert';
import { otherActionsAlertCall } from '../forms/other-actions-alert';
import { closeActionsAlertCall } from '../forms/close-actions-alert';
import { unackAlertAction, unackAlertCall } from '../forms/unack-alert';
import { getAllAlertCall } from '../forms/list-alert';
import { takeOwnershipAlertCall } from '../forms/take-ownership-alert';
import { h6, hyperlink, joinLines } from '../utils/markdown';
import { AppsOpsGenie, Routes } from '../constant';
import { replace, showMessageToMattermost } from '../utils/utils';
import { priorityAlertCall } from '../forms/priority-alert';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';
import { configureI18n } from '../utils/translations';

export const listAlertsSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;
    const call: AppCallRequest = request.body;
    const i18nObj = configureI18n(call.context);

    try {
        const [alerts, account] = await getAllAlertCall(request.body);

        const alertsWithStatusOpen: Alert[] = alerts.filter((alert: Alert) => alert.status === AlertStatus.OPEN);
        const alertsUnacked: number = alertsWithStatusOpen.filter((alert: Alert) => !alert.acknowledged).length;
        const url = `${AppsOpsGenie}${Routes.OpsGenieWeb.AlertDetailPathPrefix}`;

        const teamsText: string = [
            h6(i18nObj.__('api.list-alert.message', { alerts: alertsUnacked.toString(), openalert: alertsWithStatusOpen.length.toString(), length: alerts.length.toString() })),
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
                    const status: string = alert.acknowledged ? AlertOption.ASKED : AlertOption.UNACKED;
                    return `- #${alert.tinyId}: "${alert.message}" [${status}] - ${hyperlink(i18nObj.__('api.list-alert.detail'), alertDetailUrl)}.`;
                }).join('\n')
            )}\n`,
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
        const message = await createAlertCall(request.body);
        callResponse = newOKCallResponseWithMarkdown(message);
        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const closeAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const message = await closeAlertCall(request.body);
        callResponse = newOKCallResponseWithMarkdown(message);

        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};
export const closeAlertModal = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;
    const call: AppCallRequest = request.body;
    const i18nObj = configureI18n(call.context);

    try {
        await closeAlertAction(request.body, call.context);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage(i18nObj.__('api.list-alert.error-close-alert', { error: error.message }));
        response.json(callResponse);
    }
};

export const ackAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const message = await ackAlertCall(request.body);
        callResponse = newOKCallResponseWithMarkdown(message);

        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const ackAlertModal = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const message = await ackAlertAction(request.body);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }

    response.json(callResponse);
};

export const unackAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const message = await unackAlertCall(request.body);
        callResponse = newOKCallResponseWithMarkdown(message);

        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const unackAlertModal = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const message = await unackAlertAction(request.body);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }

    response.json(callResponse);
};

export const otherActionsAlert = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse = newOKCallResponse();

    try {
        const other = await otherActionsAlertCall(request.body);
        if (other) {
            callResponse = newFormCallResponse(other);
        }
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    response.json(callResponse);
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
        const message = await addNoteToAlertCall(request.body);
        callResponse = newOKCallResponseWithMarkdown(message);

        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const addNoteToAlertModal = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const message: string = await addNoteToAlertAction(request.body);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    response.json(callResponse);
};

export const assignAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const message = await assignAlertCall(request.body);
        callResponse = newOKCallResponseWithMarkdown(message);

        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const assignAlertModal = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const message = await assignAlertAction(request.body);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    response.json(callResponse);
};

export const snoozeAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const message = await createSnoozeAlertCall(request.body);
        callResponse = newOKCallResponseWithMarkdown(message);
        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const snoozeAlertModal = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;
    const call: AppCallAction<AppContextAction> = request.body;
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const channelId: string | undefined = call.context.post.channel_id as string;
    const userId: string = call.context.acting_user.id as string;
    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    const callR: AppCallRequest = request.body;
    const i18nObj = configureI18n(callR.context);

    try {
        await createSnoozeAlertAction(request.body, callR.context);
        const post: PostEphemeralCreate = {
            post: {
                message: i18nObj.__('api.list-alert.message-alert-snoozed'),
                channel_id: channelId,
            },
            user_id: userId
        };
        await mattermostClient.createEphemeralPost(post);
        callResponse = newOKCallResponseWithMarkdown(i18nObj.__('api.list-alert.message-alert-snoozed'));
        response.json(callResponse);
    } catch (error: any) {
        const post: PostEphemeralCreate = {
            post: {
                message: i18nObj.__('api.list-alert.error-close-alert', { error: error.message }),
                channel_id: channelId,
            },
            user_id: userId,
        };
        await mattermostClient.createEphemeralPost(post);

        callResponse = newErrorCallResponseWithMessage(i18nObj.__('api.list-alert.error-close-alert', { error: error.message }));
        response.json(callResponse);
    }
};

export const takeOwnershipAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const message = await takeOwnershipAlertCall(request.body);
        callResponse = newOKCallResponseWithMarkdown(message);

        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const priorityAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const message = await priorityAlertCall(request.body);
        callResponse = newOKCallResponseWithMarkdown(message);

        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

function isType(other: void | import("../types").AppForm) {
    throw new Error('Function not implemented.');
}

