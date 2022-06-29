import {Request, Response} from 'express';
import {
    CallResponseHandler,
    newOKCallResponseWithMarkdown
} from '../utils/call-responses';
import {AppCallResponse, Subscription} from '../types';
import {subscriptionAddCall} from '../forms/subscription-add';
import {subscriptionListCall} from '../forms/subscription-list';
import {h6, joinLines} from '../utils/markdown';
import {subscriptionDeleteCall} from '../forms/subscription-delete';
import {showMessageToMattermost} from "../utils/utils";

export const subscriptionAddSubmit: CallResponseHandler = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await subscriptionAddCall(request.body);
        callResponse = newOKCallResponseWithMarkdown("Subscription will be created");
        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const subscriptionDeleteSubmit: CallResponseHandler = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        await subscriptionDeleteCall(request.body);
        callResponse = newOKCallResponseWithMarkdown("Subscription will be deleted");
        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

export const subscriptionListSubmit: CallResponseHandler = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const integrations: Subscription[] = await subscriptionListCall(request.body);
        const subscriptionsText: string = [
            h6(`Subscription List: Found ${integrations.length} open subscriptions.`),
            `${joinLines(
                integrations.map((integration: Subscription) => 
                    `- Subscription ID: "${integration.integrationId}" - Team Name "${integration.ownerTeam.name}" - Channel Name "${integration.channelName}"`
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
