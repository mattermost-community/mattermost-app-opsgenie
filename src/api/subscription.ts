import {Request, Response} from 'express';
import {
    CallResponseHandler,
    newErrorCallResponseWithMessage,
    newOKCallResponseWithMarkdown
} from '../utils/call-responses';
import {AppCallResponse} from '../types';
import {subscriptionAddCall} from '../forms/subscription-add';

export const subscriptionAddSubmit: CallResponseHandler = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await subscriptionAddCall(request.body);
        callResponse = newOKCallResponseWithMarkdown("Subscription will be created");
        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open configuration form: ' + error.message);
        response.json(callResponse);
    }
};

export const subscriptionDeleteSubmit: CallResponseHandler = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await subscriptionAddCall(request.body);
        callResponse = newOKCallResponseWithMarkdown("Alert will be created");
        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open configuration form: ' + error.message);
        response.json(callResponse);
    }
};

export const subscriptionListSubmit: CallResponseHandler = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await subscriptionAddCall(request.body);
        callResponse = newOKCallResponseWithMarkdown("Alert will be created");
        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open configuration form: ' + error.message);
        response.json(callResponse);
    }
};
