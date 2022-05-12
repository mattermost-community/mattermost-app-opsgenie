import {Request, Response} from 'express';
import {AppCallResponse, AppForm} from '../types';
import {newErrorCallResponseWithMessage, newFormCallResponse} from '../utils/call-responses';
import {newCreateAlertForm} from "../forms/create-alert";

export const createAlert = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const form: AppForm = await newCreateAlertForm(request.body);
        callResponse = newFormCallResponse(form);

        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open create incident form: ' + error.message);
        response.json(callResponse);
    }
};
