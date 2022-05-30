import {Request, Response} from 'express';
import {AppCallResponse} from '../types';
import {newErrorCallResponseWithMessage, newOKCallResponse} from '../utils/call-responses';
import {newCreateAlertCall} from '../forms/create-alert';
import {newModalNoteToAlert} from '../forms/create-note';
import {newCreateSnoozeAlertCall} from '../forms/create-snooze';
import {assignOwnerAlertCall} from '../forms/assign-owner';
import {closeAlertCall} from '../forms/close-alert';
import {followupAlertCall} from '../forms/followup-alert';
import {otherActionsAlertCall} from '../forms/other-actions-alert';
import {closeActionsAlertCall} from '../forms/close-actions-alert';

export const createAlert = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await newCreateAlertCall(request.body);
        callResponse = newOKCallResponse();
        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('OpsGenie error: ' + error.message);
        response.json(callResponse);
    }
};

export const closeAlert = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await closeAlertCall(request.body);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open create alert form: ' + error.message);
        response.json(callResponse);
    }
};

export const followupAlert = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await followupAlertCall(request.body);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open create alert form: ' + error.message);
        response.json(callResponse);
    }
};

export const otherActionsAlert = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await otherActionsAlertCall(request.body);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open create alert form: ' + error.message);
        response.json(callResponse);
    }
};

export const closeActionsAlert = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await closeActionsAlertCall(request.body);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open create alert form: ' + error.message);
        response.json(callResponse);
    }
};

export const showModalNoteToAlert = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await newModalNoteToAlert(request.body);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open create incident form: ' + error.message);
        response.json(callResponse);
    }
}

export const assignOwnerToAlert = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await assignOwnerAlertCall(request.body);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open create incident form: ' + error.message);
        response.json(callResponse);
    }
};

export const createSnoozeAlert = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await newCreateSnoozeAlertCall(request.body);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open create incident form: ' + error.message);
        response.json(callResponse);
    }
};

