import {Request, Response} from "express";
import {AppCallResponse} from "../types";
import {newErrorCallResponseWithMessage} from "../utils/call-responses";

export const incomingWebhook = async (request: Request, response: Response) => {
    console.log('resquest', request);
    let callResponse: AppCallResponse;

    try {
        callResponse = newErrorCallResponseWithMessage('Unable to open create alert form: ');

        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open create alert form: ' + error.message);
        response.json(callResponse);
    }
};
