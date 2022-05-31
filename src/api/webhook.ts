import {Request, Response} from 'express';
import {
    Account,
    Alert,
    AlertWebhook,
    AppCallResponse,
    AssignWebhook,
    AttachmentAction,
    AttachmentOption,
    CloseAlertAction,
    Identifier,
    IdentifierType,
    NoteWebhook, OpsUser,
    ResponseResultWithData, SnoozeWebhook,
    Team,
    WebhookRequest
} from '../types';
import {newErrorCallResponseWithMessage, newOKCallResponse} from '../utils/call-responses';
import {
    ActionsEvents,
    AppMattermostConfig, AppsOpsGenie,
    option_alert_take_ownership,
    options_alert,
    Routes
} from '../constant';
import {MattermostClient, MattermostOptions} from '../clients/mattermost';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import config from '../config';
import {replace} from '../utils/utils';
import {hyperlink} from "../utils/markdown";

async function notifyAlertCreated(request: WebhookRequest<AlertWebhook>, headers: { [key: string]: any }) {
    const mattermostWebhookUrl: string = headers[AppMattermostConfig.WEBHOOK];
    const mattermostUrl: string = 'http://127.0.0.1:8066';
    const alertWebhook: AlertWebhook = request.alert;

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: config.OPSGENIE.API_KEY
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

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

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();

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
                    mattermost_site_url: mattermostUrl
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
                    mattermost_site_url: mattermostUrl
                } as CloseAlertAction
            }
        };

    const optionsFollowup: AttachmentOption[] = alert.acknowledged
        ? options_alert
        : options_alert.filter((opt: AttachmentOption) =>
            opt.value !== option_alert_take_ownership
        );
    const url: string = `${AppsOpsGenie}${Routes.OpsGenieWeb.AlertDetailPathPrefix}`;
    const alertDetailUrl: string = replace(
        replace(
            url,
            Routes.PathsVariable.Account,
            account.data.name
        ),
        Routes.PathsVariable.Identifier,
        alert.id
    );

    const payload = {
        text: '',
        username: 'opsgenie',
        icon_url: `${config.APP.HOST}/static/opsgenie_picture.png`,
        attachments: [
            {
                title: `#${alert.tinyId}: ${alert.message}`,
                title_link: alertDetailUrl,
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
                                mattermost_site_url: mattermostUrl
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
                                mattermost_site_url: mattermostUrl
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

async function notifyNoteCreated(request: WebhookRequest<NoteWebhook>, headers: { [key: string]: any }) {
    const mattermostWebhookUrl: string = headers[AppMattermostConfig.WEBHOOK];
    const mattermostUrl: string = 'http://127.0.0.1:8066';
    const alert: NoteWebhook = request.alert;

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: config.OPSGENIE.API_KEY
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();

    const url: string = `${AppsOpsGenie}${Routes.OpsGenieWeb.AlertDetailPathPrefix}`;
    const alertDetailUrl: string = replace(
        replace(
            url,
            Routes.PathsVariable.Account,
            account.data.name
        ),
        Routes.PathsVariable.Identifier,
        alert.alertId
    );
    const payload = {
        text: '',
        username: 'opsgenie',
        icon_url: `${config.APP.HOST}/static/opsgenie_picture.png`,
        attachments: [
            {
                text: `${alert.username} added note "${alert.note}" to alert ${hyperlink(`#${alert.tinyId}`, alertDetailUrl)} "${alert.message}"`,
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

async function notifyCloseAlert(request: WebhookRequest<AlertWebhook>, headers: { [key: string]: any }) {
    const mattermostWebhookUrl: string = headers[AppMattermostConfig.WEBHOOK];
    const mattermostUrl: string = 'http://127.0.0.1:8066';
    const alert: AlertWebhook = request.alert;

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: config.OPSGENIE.API_KEY
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();

    const url: string = `${AppsOpsGenie}${Routes.OpsGenieWeb.AlertDetailPathPrefix}`;
    const alertDetailUrl: string = replace(
        replace(
            url,
            Routes.PathsVariable.Account,
            account.data.name
        ),
        Routes.PathsVariable.Identifier,
        alert.alertId
    );
    const payload = {
        text: '',
        username: 'opsgenie',
        icon_url: `${config.APP.HOST}/static/opsgenie_picture.png`,
        attachments: [
            {
                text: `${alert.username} closed alert ${hyperlink(`#${alert.tinyId}`, alertDetailUrl)} "${alert.message}"`,
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

async function notifyAckAlert(request: WebhookRequest<AlertWebhook>, headers: { [key: string]: any }) {
    const mattermostWebhookUrl: string = headers[AppMattermostConfig.WEBHOOK];
    const mattermostUrl: string = 'http://127.0.0.1:8066';
    const alert: AlertWebhook = request.alert;

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: config.OPSGENIE.API_KEY
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();

    const url: string = `${AppsOpsGenie}${Routes.OpsGenieWeb.AlertDetailPathPrefix}`;
    const alertDetailUrl: string = replace(
        replace(
            url,
            Routes.PathsVariable.Account,
            account.data.name
        ),
        Routes.PathsVariable.Identifier,
        alert.alertId
    );
    const payload = {
        text: '',
        username: 'opsgenie',
        icon_url: `${config.APP.HOST}/static/opsgenie_picture.png`,
        attachments: [
            {
                text: `${alert.username} acknowledged alert ${hyperlink(`#${alert.tinyId}`, alertDetailUrl)} "${alert.message}"`,
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

async function notifyUnackAlert(request: WebhookRequest<AlertWebhook>, headers: { [key: string]: any }) {
    const mattermostWebhookUrl: string = headers[AppMattermostConfig.WEBHOOK];
    const mattermostUrl: string = 'http://127.0.0.1:8066';
    const alert: AlertWebhook = request.alert;

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: config.OPSGENIE.API_KEY
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();

    const url: string = `${AppsOpsGenie}${Routes.OpsGenieWeb.AlertDetailPathPrefix}`;
    const alertDetailUrl: string = replace(
        replace(
            url,
            Routes.PathsVariable.Account,
            account.data.name
        ),
        Routes.PathsVariable.Identifier,
        alert.alertId
    );
    const payload = {
        text: '',
        username: 'opsgenie',
        icon_url: `${config.APP.HOST}/static/opsgenie_picture.png`,
        attachments: [
            {
                text: `${alert.username} un-acknowledged alert ${hyperlink(`#${alert.tinyId}`, alertDetailUrl)} "${alert.message}"`,
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

async function notifySnoozeAlert(request: WebhookRequest<SnoozeWebhook>, headers: { [key: string]: any }) {
    const mattermostWebhookUrl: string = headers[AppMattermostConfig.WEBHOOK];
    const mattermostUrl: string = 'http://127.0.0.1:8066';
    const alert: SnoozeWebhook = request.alert;

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: config.OPSGENIE.API_KEY
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();

    const url: string = `${AppsOpsGenie}${Routes.OpsGenieWeb.AlertDetailPathPrefix}`;
    const alertDetailUrl: string = replace(
        replace(
            url,
            Routes.PathsVariable.Account,
            account.data.name
        ),
        Routes.PathsVariable.Identifier,
        alert.alertId
    );
    const payload = {
        text: '',
        username: 'opsgenie',
        icon_url: `${config.APP.HOST}/static/opsgenie_picture.png`,
        attachments: [
            {
                text: `${alert.username} snoozed alert ${hyperlink(`#${alert.tinyId}`, alertDetailUrl)} "${alert.message}" until ${alert.snoozeEndDate}`,
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

async function notifySnoozeEndedAlert(request: WebhookRequest<AlertWebhook>, headers: { [key: string]: any }) {
    const mattermostWebhookUrl: string = headers[AppMattermostConfig.WEBHOOK];
    const mattermostUrl: string = 'http://127.0.0.1:8066';
    const alert: AlertWebhook = request.alert;

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: config.OPSGENIE.API_KEY
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();

    const url: string = `${AppsOpsGenie}${Routes.OpsGenieWeb.AlertDetailPathPrefix}`;
    const alertDetailUrl: string = replace(
        replace(
            url,
            Routes.PathsVariable.Account,
            account.data.name
        ),
        Routes.PathsVariable.Identifier,
        alert.alertId
    );
    const payload = {
        text: '',
        username: 'opsgenie',
        icon_url: `${config.APP.HOST}/static/opsgenie_picture.png`,
        attachments: [
            {
                text: `Snooze expired for the alert ${hyperlink(`#${alert.tinyId}`, alertDetailUrl)} "${alert.message}"`,
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

async function notifyAssignOwnershipAlert(request: WebhookRequest<AssignWebhook>, headers: { [key: string]: any }) {
    const mattermostWebhookUrl: string = headers[AppMattermostConfig.WEBHOOK];
    const mattermostUrl: string = 'http://127.0.0.1:8066';
    const alert: AssignWebhook = request.alert;

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: config.OPSGENIE.API_KEY
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();

    const identifier: Identifier = {
        identifier: alert.owner,
        identifierType: IdentifierType.USERNAME
    };
    const user: ResponseResultWithData<OpsUser> = await opsGenieClient.getUser(identifier);

    const url: string = `${AppsOpsGenie}${Routes.OpsGenieWeb.AlertDetailPathPrefix}`;
    const alertDetailUrl: string = replace(
        replace(
            url,
            Routes.PathsVariable.Account,
            account.data.name
        ),
        Routes.PathsVariable.Identifier,
        alert.alertId
    );
    const payload = {
        text: '',
        username: 'opsgenie',
        icon_url: `${config.APP.HOST}/static/opsgenie_picture.png`,
        attachments: [
            {
                text: `${alert.username} assigned ownership of the alert ${hyperlink(`#${alert.tinyId}`, alertDetailUrl)} to ${user.data.fullName} "${alert.message}"`,
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

async function notifyUpdatePriorityAlert(request: WebhookRequest<AssignWebhook>, headers: { [key: string]: any }) {
    const mattermostWebhookUrl: string = headers[AppMattermostConfig.WEBHOOK];
    const mattermostUrl: string = 'http://127.0.0.1:8066';
    const alert: AssignWebhook = request.alert;

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: config.OPSGENIE.API_KEY
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();

    const url: string = `${AppsOpsGenie}${Routes.OpsGenieWeb.AlertDetailPathPrefix}`;
    const alertDetailUrl: string = replace(
        replace(
            url,
            Routes.PathsVariable.Account,
            account.data.name
        ),
        Routes.PathsVariable.Identifier,
        alert.alertId
    );
    const payload = {
        text: '',
        username: 'opsgenie',
        icon_url: `${config.APP.HOST}/static/opsgenie_picture.png`,
        attachments: [
            {
                text: `${alert.username} changed the priority of the alert ${hyperlink(`#${alert.tinyId}`, alertDetailUrl)} "${alert.message}" from ${alert.oldPriority} to ${alert.priority}`,
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
    Create: notifyAlertCreated,
    AddNote: notifyNoteCreated,
    Close: notifyCloseAlert,
    Acknowledge: notifyAckAlert,
    UnAcknowledge: notifyUnackAlert,
    Snooze: notifySnoozeAlert,
    SnoozeEnded: notifySnoozeEndedAlert,
    AssignOwnership: notifyAssignOwnershipAlert,
    UpdatePriority: notifyUpdatePriorityAlert
};

export const incomingWebhook = async (request: Request, response: Response) => {
    const data: WebhookRequest<any> = request.body;
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
        callResponse = newErrorCallResponseWithMessage('Error webhook: ' + error.message);
        response.json(callResponse);
    }
};
