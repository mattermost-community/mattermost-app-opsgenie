import {Request, Response} from 'express';
import {
    Alert,
    AlertWebhook,
    AppCallResponse,
    AttachmentAction,
    AttachmentOption,
    CloseAlertAction,
    Identifier,
    IdentifierType,
    ResponseResultWithData,
    Team,
    WebhookRequest
} from '../types';
import {newErrorCallResponseWithMessage, newOKCallResponse} from '../utils/call-responses';
import {
    ActionsEvents,
    AppMattermostConfig,
    option_alert_take_ownership,
    options_alert,
    Routes
} from '../constant';
import {MattermostClient, MattermostOptions} from '../clients/mattermost';
import {OpsGenieClient} from '../clients/opsgenie';
import config from '../config';

async function notifyAlertCreated(request: WebhookRequest, headers: { [key: string]: any }) {
    const mattermostWebhookUrl: string = headers[AppMattermostConfig.WEBHOOK];
    const alertWebhook: AlertWebhook = request.alert;

    const opsGenieClient = new OpsGenieClient();

    const identifier: Identifier = {
        identifier: alertWebhook.alertId,
        identifierType: IdentifierType.ID
    };
    const responseAlert: ResponseResultWithData<Alert> = await opsGenieClient.getAlert(identifier);
    const alert: Alert = responseAlert.data;

    const teamsPromise: Promise<ResponseResultWithData<Team>>[] = alert.teams.map((team) => {
        const teamParams: Identifier = {
            identifier: team.id,
            identifierType: IdentifierType.ID
        };
        return opsGenieClient.getTeam(teamParams);
    });
    const teams: ResponseResultWithData<Team>[] = await Promise.all(teamsPromise);
    const teamsName: string[] = teams.map((team: ResponseResultWithData<Team>) =>
        team.data.name
    );

    const followupAlertAction: AttachmentAction = alert.acknowledged
        ? {
            id: ActionsEvents.UNACKNOWLEDGE_ALERT_BUTTON_EVENT,
            name: 'Unacknowledge',
            type: 'button',
            style: 'default',
            integration: {
                url: `${config.APP.HOST}${Routes.App.CallPathAlertUnacknowledge}`,
                context: {
                    action: ActionsEvents.UNACKNOWLEDGE_ALERT_BUTTON_EVENT,
                    alert: {
                        id: alert.id,
                        message: alert.message,
                        tinyId: alert.tinyId
                    },
                    bot_access_token: '',
                    mattermost_site_url: ''
                } as CloseAlertAction
            }
        }
        : {
            id: ActionsEvents.ACKNOWLEDGED_ALERT_BUTTON_EVENT,
            name: 'Acknowledged',
            type: 'button',
            style: 'default',
            integration: {
                url: `${config.APP.HOST}${Routes.App.CallPathAlertAcknowledged}`,
                context: {
                    action: ActionsEvents.ACKNOWLEDGED_ALERT_BUTTON_EVENT,
                    alert: {
                        id: alert.id,
                        message: alert.message,
                        tinyId: alert.tinyId
                    },
                    bot_access_token: '',
                    mattermost_site_url: ''
                } as CloseAlertAction
            }
        };

    const optionsFollowup: AttachmentOption[] = alert.acknowledged
        ? options_alert
        : options_alert.filter((opt: AttachmentOption) =>
            opt.value !== option_alert_take_ownership
        );
    const payload = {
        text: '',
        username: 'opsgenie',
        icon_url: `${config.APP.HOST}/static/opsgenie_picture.png`,
        attachments: [
            {
                title: `#${alert.tinyId}: ${alert.message}`,
                title_link: `https://testancient.app.opsgenie.com/alert/detail/${alert.id}`,
                fields: [
                    {
                        short: true,
                        title: 'Priority',
                        value: alert.priority
                    },
                    {
                        short: true,
                        title: 'Routed Teams',
                        value: teamsName.join(', ')
                    }
                ],
                actions: [
                    followupAlertAction,
                    {
                        id: ActionsEvents.CLOSE_ALERT_BUTTON_EVENT,
                        name: 'Close',
                        type: 'button',
                        style: 'success',
                        integration: {
                            url: `${config.APP.HOST}${Routes.App.CallPathAlertClose}`,
                            context: {
                                action: ActionsEvents.CLOSE_ALERT_BUTTON_EVENT,
                                alert: {
                                    id: alert.id,
                                    message: alert.message,
                                    tinyId: alert.tinyId
                                },
                                bot_access_token: '',
                                mattermost_site_url: ''
                            } as CloseAlertAction
                        }
                    },
                    {
                        id: ActionsEvents.OTHER_OPTIONS_SELECT_EVENT,
                        name: 'Other actions...',
                        integration: {
                            url: `${config.APP.HOST}${Routes.App.CallPathAlertOtherActions}`,
                            context: {
                                action: ActionsEvents.OTHER_OPTIONS_SELECT_EVENT,
                                alert: {
                                    id: alert.id,
                                    message: alert.message,
                                    tinyId: alert.tinyId
                                },
                                bot_access_token: '',
                                mattermost_site_url: ''
                            } as CloseAlertAction
                        },
                        type: 'select',
                        options: optionsFollowup
                    }
                ]
            }
        ]
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: mattermostWebhookUrl,
        accessToken: null
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.incomingWebhook(payload);
}

const WEBHOOKS_ACTIONS: { [key: string]: Function } = {
    Create: notifyAlertCreated
};

export const incomingWebhook = async (request: Request, response: Response) => {
    const data: WebhookRequest = request.body;
    const headers = request.headers;
    console.log('webhook', data);

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
