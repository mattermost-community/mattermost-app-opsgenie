import {
    CallResponseHandler,
    newErrorCallResponseWithMessage,
    newFormCallResponse,
    newOKCallResponseWithMarkdown
} from '../utils/call-responses';
import {AppCallResponse} from '../types';
import {opsGenieConfigForm, opsGenieConfigSubmit} from '../forms/configure-admin-account';

export const configureAdminAccountForm: CallResponseHandler = async (req, res) => {
    let callResponse: AppCallResponse;

    try {
        const form = await opsGenieConfigForm(req.body);
        callResponse = newFormCallResponse(form);
        res.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open configuration form: ' + error.message);
        res.json(callResponse);
    }
};

export const configureAdminAccountSubmit: CallResponseHandler = async (req, res) => {
    let callResponse: AppCallResponse;

    try {
        await opsGenieConfigSubmit(req.body);
        callResponse = newOKCallResponseWithMarkdown('Successfully updated OpsGenie configuration');
        res.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to submit configuration form: ' + error.message);
        res.json(callResponse);
    }
};

