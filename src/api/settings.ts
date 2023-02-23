import { Request, Response } from 'express';

import {
    CallResponseHandler,
    newFormCallResponse,
    newOKCallResponseWithMarkdown,
} from '../utils/call-responses';
import { AppCallResponse } from '../types';
import { showMessageToMattermost } from '../utils/utils';
import { settingsForm, settingsFormSubmit } from '../forms/settings';

export const appSettingsForm: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: AppCallResponse;

    try {
        const form = await settingsForm(req.body);
        callResponse = newFormCallResponse(form);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    res.json(callResponse);
};

export const appSettingsSubmit: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: AppCallResponse;

    try {
        const message = await settingsFormSubmit(req.body);
        callResponse = newOKCallResponseWithMarkdown(message);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
    }
    res.json(callResponse);
};