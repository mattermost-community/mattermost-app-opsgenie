import { Request, Response } from 'express';

import {
    CallResponseHandler,
    newFormCallResponse,
    newOKCallResponseWithMarkdown,
} from '../utils/call-responses';
import { AppCallResponse, AppForm } from '../types';
import { subscriptionAddCall, subscriptionAddFormCall } from '../forms/subscription-add';
import { subscriptionListCall } from '../forms/subscription-list';
import { subscriptionDeleteCall } from '../forms/subscription-delete';
import { showMessageToMattermost } from '../utils/utils';

export const subscriptionAddForm: CallResponseHandler = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const form: AppForm = await subscriptionAddFormCall(request.body);
        callResponse = newFormCallResponse(form);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    response.json(callResponse);
};

export const subscriptionAddSubmit: CallResponseHandler = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const message = await subscriptionAddCall(request.body);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    response.json(callResponse);
};

export const subscriptionDeleteSubmit: CallResponseHandler = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const message = await subscriptionDeleteCall(request.body);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    response.json(callResponse);
};

export const subscriptionListSubmit: CallResponseHandler = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const subscriptionsText: string = await subscriptionListCall(request.body);
        callResponse = newOKCallResponseWithMarkdown(subscriptionsText);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    response.json(callResponse);
};
