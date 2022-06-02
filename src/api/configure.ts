import {
    CallResponseHandler,
    newErrorCallResponseWithMessage,
    newFormCallResponse,
    newOKCallResponseWithMarkdown
} from '../utils/call-responses';
import {AppCallRequest, AppCallResponse} from '../types';
import {opsGenieConfigForm, opsGenieConfigSubmit} from '../forms/configure-admin-account';
import {hyperlink} from '../utils/markdown';

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

export const connectAccountSubmit: CallResponseHandler = async (req, res) => {
    const call: AppCallRequest = req.body;
    const connectUrl: string = call.context.oauth2.connect_url;

    const callResponse: AppCallResponse = newOKCallResponseWithMarkdown(`Follow this ${hyperlink('link', connectUrl)} to connect Mattermost to your OpsGenie Account.`);
    res.json(callResponse);
};

