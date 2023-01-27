import { Request, Response } from 'express';

import {
    AlertWebhook,
    AppCallResponse,
    AppContext,
    WebhookAppCallRequestType,
    WebhookDataAction,
    WebhookFunctionType,
} from '../types';
import { newErrorCallResponseWithMessage, newOKCallResponse } from '../utils/call-responses';
import { configureI18n } from '../utils/translations';
import { notifyAckAlert, notifyAlertCreated, notifyAssignOwnershipAlert, notifyCloseAlert, notifyNoteCreated, notifySnoozeAlert, notifySnoozeEndedAlert, notifyUnackAlert, notifyUpdatePriorityAlert } from '../forms/webhook-post';

const WEBHOOKS_ACTIONS: { [key in WebhookDataAction]: WebhookFunctionType } = {
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
    const webhookRequest: WebhookAppCallRequestType = request.body;
    const context: AppContext = webhookRequest.context;
    const i18nObj = configureI18n(context);

    let callResponse: AppCallResponse;
    try {
        const action: WebhookFunctionType = WEBHOOKS_ACTIONS[webhookRequest.values.data.action];
        if (action) {
            await action(webhookRequest);
        }
        callResponse = newOKCallResponse();
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage(i18nObj.__('api.webhook.error', { message: error.message }));
    }

    response.json(callResponse);
};