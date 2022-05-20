import {Request, Response} from "express";
import {AppCallResponse, WebhookRequest} from "../types";
import {newErrorCallResponseWithMessage, newOKCallResponse} from "../utils/call-responses";

async function notifyAlertCreated(request: WebhookRequest) {

}

const WEBHOOKS_ACTIONS: any = {
    Create: notifyAlertCreated
};

export const incomingWebhook = async (request: Request, response: Response) => {
    const data: WebhookRequest = request.body;
    let callResponse: AppCallResponse;

    try {
        console.log('request', request);

        callResponse = newOKCallResponse();
        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open create alert form: ' + error.message);
        response.json(callResponse);
    }
};
