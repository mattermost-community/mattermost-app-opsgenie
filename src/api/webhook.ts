import { Request, Response } from 'express';

import {
    AppCallResponse,
    AppContext,
    WebhookAppCallRequest,
} from '../types';
import { newErrorCallResponseWithMessage, newOKCallResponse } from '../utils/call-responses';
import { configureI18n } from '../utils/translations';
import { WebhookFunction } from '../types/functions';
import { notifyAckAlert, notifyAlertCreated, notifyAssignOwnershipAlert, notifyCloseAlert, notifyNoteCreated, notifySnoozeAlert, notifySnoozeEndedAlert, notifyUnackAlert, notifyUpdatePriorityAlert } from '../forms/webhook-post';

const WEBHOOKS_ACTIONS: { [key: string]: WebhookFunction } = {
    Create: notifyAlertCreated,
    AddNote: notifyNoteCreated,
    Close: notifyCloseAlert,
    Acknowledge: notifyAckAlert,
    UnAcknowledge: notifyUnackAlert,
    Snooze: notifySnoozeAlert,
    SnoozeEnded: notifySnoozeEndedAlert,
    AssignOwnership: notifyAssignOwnershipAlert,
    UpdatePriority: notifyUpdatePriorityAlert,
};

export const incomingWebhook = async (request: Request, response: Response) => {
    const webhookRequest: WebhookAppCallRequest<any> = request.body;
    const context: AppContext = webhookRequest.context;
    const i18nObj = configureI18n(context);

    let callResponse: AppCallResponse;
    try {
        console.log('data', webhookRequest.values.data);
        const action: WebhookFunction = WEBHOOKS_ACTIONS[webhookRequest.values.data.action];
        if (action) {
            await action(webhookRequest);
        }
        callResponse = newOKCallResponse();
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage(i18nObj.__('api.webhook.error', { message: error.message }));
    }

    response.json(callResponse);
};