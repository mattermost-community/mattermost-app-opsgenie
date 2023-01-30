import { Request, Response } from 'express';

import {
    Alert,
    AlertOption,
    AlertStatus,
    AppCallRequest,
    AppCallResponse,
    AppForm,
} from '../types';
import {
    newFormCallResponse,
    newOKCallResponse,
    newOKCallResponseWithMarkdown,
} from '../utils/call-responses';
import { createAlertCall } from '../forms/create-alert';
import { addNoteToAlertAction, addNoteToAlertCall } from '../forms/create-note';
import { createSnoozeAlertAction, createSnoozeAlertCall } from '../forms/create-snooze';
import { assignAlertAction, assignAlertCall } from '../forms/assign-alert';
import { closeAlertCall, closeAlertForm } from '../forms/close-alert';
import { ackAlertAction, ackAlertCall } from '../forms/ack-alert';
import { otherActionsAlertCall } from '../forms/other-actions-alert';
import { unackAlertAction, unackAlertCall } from '../forms/unack-alert';
import { getAllAlertCall } from '../forms/list-alert';
import { takeOwnershipAlertCall } from '../forms/take-ownership-alert';
import { h6, hyperlink, joinLines } from '../utils/markdown';
import { AppsOpsGenie, Routes } from '../constant';
import { replace, showMessageToMattermost } from '../utils/utils';
import { priorityAlertCall } from '../forms/priority-alert';
import { configureI18n } from '../utils/translations';

export const listAlertsSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;
    const call: AppCallRequest = request.body;
    const i18nObj = configureI18n(call.context);

    try {
        const message = await getAllAlertCall(request.body);
        callResponse = newOKCallResponseWithMarkdown(message);
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
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }

    response.json(callResponse);
};

export const closeAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const message = await closeAlertCall(request.body);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }

    response.json(callResponse);
};

export const closeAlertModal = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const form = await closeAlertForm(request.body);
        callResponse = newFormCallResponse(form);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    response.json(callResponse);
};

export const ackAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const message = await ackAlertCall(request.body);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }

    response.json(callResponse);
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
        if (other !== 'null' && typeof other === 'object') {
            callResponse = newFormCallResponse(<AppForm>other);
        }
        if (typeof other === 'string') {
            callResponse = newOKCallResponseWithMarkdown(other);
        }
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    response.json(callResponse);
};

export const addNoteToAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const message = await addNoteToAlertCall(request.body);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }

    response.json(callResponse);
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
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }

    response.json(callResponse);
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
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }

    response.json(callResponse);
};

export const snoozeAlertModal = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const message = await createSnoozeAlertAction(request.body);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }

    response.json(callResponse);
};

export const takeOwnershipAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const message = await takeOwnershipAlertCall(request.body);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }

    response.json(callResponse);
};

export const priorityAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const message = await priorityAlertCall(request.body);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }

    response.json(callResponse);
};
