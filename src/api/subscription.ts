import {Request, Response} from 'express';
import {
    CallResponseHandler,
    newOKCallResponseWithMarkdown
} from '../utils/call-responses';
import {AppCallRequest, AppCallResponse, Subscription} from '../types';
import {subscriptionAddCall} from '../forms/subscription-add';
import {subscriptionListCall} from '../forms/subscription-list';
import {h6, joinLines} from '../utils/markdown';
import {subscriptionDeleteCall} from '../forms/subscription-delete';
import {configureI18n} from "../utils/translations";
import {showMessageToMattermost} from "../utils/utils";

export const subscriptionAddSubmit: CallResponseHandler = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;
		const call: AppCallRequest = request.body;
		const i18nObj = configureI18n(call.context);

    try {
        await subscriptionAddCall(request.body);
        callResponse = newOKCallResponseWithMarkdown(i18nObj.__('api.subcription.message-created'));
        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const subscriptionDeleteSubmit: CallResponseHandler = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;
		const call: AppCallRequest = request.body;
		const i18nObj = configureI18n(call.context);

    try {
        await subscriptionDeleteCall(request.body);
        callResponse = newOKCallResponseWithMarkdown(i18nObj.__('api.subcription.message-delete'));
        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const subscriptionListSubmit: CallResponseHandler = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;
		const call: AppCallRequest = request.body;
		const i18nObj = configureI18n(call.context);

    try {
        const integrations: Subscription[] = await subscriptionListCall(request.body);
        const subscriptionsText: string = [
            h6(i18nObj.__('api.subcription.message-list', { integrations: integrations.length.toString() })),
            `${joinLines(
                integrations.map((integration: Subscription) => 
										i18nObj.__('api.subcription.detail-list', { integration: integration.integrationId, name: integration.ownerTeam.name, channelName: integration.channelName })
                ).join('\n')
            )}`
        ].join('');

        callResponse = newOKCallResponseWithMarkdown(subscriptionsText);
        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};
