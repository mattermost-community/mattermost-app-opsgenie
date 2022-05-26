import {CallResponseHandler, newErrorCallResponseWithMessage, newFormCallResponse} from '../utils/call-responses';
import {AppCallResponse} from '../types';
import {opsGenieConfigForm} from '../forms/configure-admin-account';

export const configureAdminAccount: CallResponseHandler = async (req, res) => {
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
