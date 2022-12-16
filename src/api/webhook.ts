import { Request, Response } from 'express';

import {
    AppCallResponse,
    AppContext,
    WebhookRequest,
} from '../types';
import { newErrorCallResponseWithMessage, newOKCallResponse } from '../utils/call-responses';
import { configureI18n } from '../utils/translations';
import { WebhookFunction } from '../types/functions';
import { notifyNoteCreated, notifyCloseAlert, notifyAckAlert, notifyUnackAlert, notifySnoozeAlert, notifySnoozeEndedAlert, notifyAssignOwnershipAlert, notifyUpdatePriorityAlert, notifyAlertCreated } from '../forms/webhook-post';

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
    const webhookRequest: WebhookRequest<any> = request.body.values;
    const context: AppContext = request.body.context;
    const i18nObj = configureI18n(context);

    let callResponse: AppCallResponse;
    try {
        console.log('data', webhookRequest.data);
        const action: WebhookFunction = WEBHOOKS_ACTIONS[webhookRequest.data.action];
        if (action) {
            await action(webhookRequest, context);
        }
        callResponse = newOKCallResponse();
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage(i18nObj.__('api.webhook.error', { message: error.message }));
    }

    response.json(callResponse);
};