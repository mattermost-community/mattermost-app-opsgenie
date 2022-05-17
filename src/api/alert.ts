import {Request, Response} from 'express';
import {AppCallResponse, AppForm} from '../types';
import {newErrorCallResponseWithMessage, newFormCallResponse} from '../utils/call-responses';
import {newCreateAlertForm} from '../forms/create-alert';
import {newCreateNoteToAlertForm} from '../forms/create-note';
import {newCreateSnoozeAlertForm} from '../forms/create-snooze';
import {assignOwnerAlertForm} from '../forms/assign-owner';

export const createAlert = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const form: AppForm = await newCreateAlertForm(request.body);
        callResponse = newFormCallResponse(form);

        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open create alert form: ' + error.message);
        response.json(callResponse);
    }
};

export const createNoteToAlert = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const form: AppForm = await newCreateNoteToAlertForm(request.body);
        callResponse = newFormCallResponse(form);

        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open create incident form: ' + error.message);
        response.json(callResponse);
    }
};

export const createSnoozeAlert = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const form: AppForm = await newCreateSnoozeAlertForm(request.body);
        callResponse = newFormCallResponse(form);

        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open create incident form: ' + error.message);
        response.json(callResponse);
    }
};

export const assignOwnerToAlert = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const form: AppForm = await assignOwnerAlertForm(request.body);
        callResponse = newFormCallResponse(form);

        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open create incident form: ' + error.message);
        response.json(callResponse);
    }
};

