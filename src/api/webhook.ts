import {Request, Response} from 'express';
import {AlertWebhook, AppCallResponse, CloseAlertAction, PostCreate, WebhookRequest} from '../types';
import {newErrorCallResponseWithMessage, newOKCallResponse} from '../utils/call-responses';
import {Actions, AppMattermostConfig, Routes} from '../constant';
import {MattermostClient, MattermostOptions} from '../clients/mattermost';
import config from "../config";

async function notifyAlertCreated(request: WebhookRequest, headers: { [key: string]: any }) {
    const mattermostWebhookUrl: string = headers[AppMattermostConfig.WEBHOOK];
    const alert: AlertWebhook = request.alert;

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: mattermostWebhookUrl,
        accessToken: null
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    const payload = {
        text: 'Hola',
        props: {
            attachments: [
                {
                    title: `#${alert.tinyId}: ${alert.message}`,
                    title_link: `https://testancient.app.opsgenie.com/alert/detail/${alert.alertId}`,
                    fields: [
                        {
                            short: true,
                            title: 'Priority',
                            value: alert.priority
                        },
                        {
                            short: true,
                            title: 'Routed Teams',
                            value: 'mattermost'
                        }
                    ],
                    actions: [
                        {
                            id: Actions.CLOSE_ALERT_BUTTON_EVENT,
                            name: 'Close',
                            type: 'button',
                            style: 'success',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathAlertClose}`,
                                context: {
                                    action: Actions.CLOSE_ALERT_BUTTON_EVENT
                                } as CloseAlertAction
                            }
                        }
                    ]
                }
            ]
        }
    };
    try {
        const data = await mattermostClient.incomingWebhook(payload);
        console.log('data webhook', data);
    } catch (error) {
        console.log('error webhook', error);
    }
}

const WEBHOOKS_ACTIONS: { [key: string]: Function } = {
    Create: notifyAlertCreated
};

export const incomingWebhook = async (request: Request, response: Response) => {
    const data: WebhookRequest = request.body;
    const headers = request.headers;

    let callResponse: AppCallResponse;
    try {
        const action: Function = WEBHOOKS_ACTIONS[data.action];
        if (action) {
            await action(data, headers);
        }
        callResponse = newOKCallResponse();
        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open create alert form: ' + error.message);
        response.json(callResponse);
    }
};
