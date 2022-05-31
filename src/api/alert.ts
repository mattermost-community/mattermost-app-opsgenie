import {Request, Response} from 'express';
import {AppCallResponse} from '../types';
import {newErrorCallResponseWithMessage, newOKCallResponse} from '../utils/call-responses';
import {newCreateAlertCall} from '../forms/create-alert';
import {addNoteToAlertCall} from '../forms/create-note';
import {createSnoozeAlertCall} from '../forms/create-snooze';
import {assignOwnerAlertCall} from '../forms/assign-owner';
import {closeAlertCall} from '../forms/close-alert';
import {ackAlertCall} from '../forms/ack-alert';
import {otherActionsAlertCall} from '../forms/other-actions-alert';
import {closeActionsAlertCall} from '../forms/close-actions-alert';
import {unackAlertCall} from '../forms/unack-alert';

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

export const closeAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await closeAlertCall(request.body);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unexpected error: ' + error.message);
        response.json(callResponse);
    }
};

export const ackAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await ackAlertCall(request.body);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unexpected error: ' + error.message);
        response.json(callResponse);
    }
};

export const unackAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await unackAlertCall(request.body);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unexpected error: ' + error.message);
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

export const addNoteToAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await addNoteToAlertCall(request.body);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unexpected error: ' + error.message);
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

export const snoozeAlertSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await createSnoozeAlertCall(request.body);
        callResponse = newOKCallResponse();

        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unexpected error: ' + error.message);
        response.json(callResponse);
    }
};

