import { Request, Response } from 'express';

import {
    CallResponseHandler,
    newFormCallResponse,
    newOKCallResponseWithMarkdown,
} from '../utils/call-responses';
import { AppCallResponse } from '../types';
import { opsGenieConfigForm, opsGenieConfigSubmit } from '../forms/configure-admin-account';
import { showMessageToMattermost } from '../utils/utils';

export const configureAdminAccountForm: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: AppCallResponse;

    try {
        const form = await opsGenieConfigForm(req.body);
        callResponse = newFormCallResponse(form);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    res.json(callResponse);
};

export const configureAdminAccountSubmit: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: AppCallResponse;

    try {
        const message = await opsGenieConfigSubmit(req.body);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    res.json(callResponse);
};