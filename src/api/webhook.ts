import {Request, Response} from 'express';
import {
    Account,
    AlertWebhook,
    AppCallResponse,
    AppContext,
    AssignWebhook,
    CloseAlertAction,
    Identifier,
    IdentifierType,
    NoteWebhook,
    OpsUser,
    PostCreate,
    ResponseResultWithData,
    SnoozeWebhook,
    Team,
    WebhookRequest
} from '../types';
import {newErrorCallResponseWithMessage, newOKCallResponse} from '../utils/call-responses';
import {
    ActionsEvents,
    options_alert,
    Routes, StoreKeys
} from '../constant';
import {MattermostClient, MattermostOptions} from '../clients/mattermost';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import config from '../config';
import {getAlertDetailUrl} from '../utils/utils';
import {hyperlink} from "../utils/markdown";
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from "../clients/kvstore";

async function notifyAlertCreated(event: WebhookRequest<AlertWebhook>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const alert: AlertWebhook = event.alert;

    const kvOptions: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const kvStoreClient: KVStoreClient = new KVStoreClient(kvOptions);

    const configStore: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const teamsPromise: Promise<ResponseResultWithData<Team>>[] = alert.teams.map((teamId: string) => {
        const teamParams: Identifier = {
            identifier: teamId,
            identifierType: IdentifierType.ID
        };
        return opsGenieClient.getTeam(teamParams);
    });
    const teams: ResponseResultWithData<Team>[] = await Promise.all(teamsPromise);
    const teamsName: string[] = teams.map((team: ResponseResultWithData<Team>) =>
        team.data.name
    );

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();

    const url: string = getAlertDetailUrl(account.data.name, alert.alertId);
    const payload: PostCreate = {
        message: '',
        channel_id: 'yhso3rs8b3d7pnyaoh63km9fir',
        props: {
            attachments: [
                {
                    title: `#${alert.tinyId}: ${alert.message}`,
                    title_link: url,
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
                        {
                            id: ActionsEvents.ACKNOWLEDGED_ALERT_BUTTON_EVENT,
                            name: 'Acknowledged',
                            type: 'button',
                            style: 'default',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathAlertAcknowledged}`,
                                context: {
                                    action: ActionsEvents.ACKNOWLEDGED_ALERT_BUTTON_EVENT,
                                    alert: {
                                        id: alert.alertId,
                                        message: alert.message,
                                        tinyId: alert.tinyId
                                    },
                                    bot_access_token: botAccessToken,
                                    mattermost_site_url: mattermostUrl
                                } as CloseAlertAction
                            }
                        },
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
                                        id: alert.alertId,
                                        message: alert.message,
                                        tinyId: alert.tinyId
                                    },
                                    bot_access_token: botAccessToken,
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
                                        id: alert.alertId,
                                        message: alert.message,
                                        tinyId: alert.tinyId
                                    },
                                    bot_access_token: botAccessToken,
                                    mattermost_site_url: mattermostUrl
                                } as CloseAlertAction
                            },
                            type: 'select',
                            options: options_alert
                        }
                    ]
                }
            ]
        }
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

async function notifyNoteCreated(request: WebhookRequest<NoteWebhook>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const alert: NoteWebhook = request.alert;

    const kvOptions: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const kvStoreClient: KVStoreClient = new KVStoreClient(kvOptions);

    const configStore: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();

    const url: string = getAlertDetailUrl(account.data.name, alert.alertId);
    const payload: PostCreate = {
        message: '',
        channel_id: 'yhso3rs8b3d7pnyaoh63km9fir',
        props: {
            attachments: [
                {
                    text: `${alert.username} added note "${alert.note}" to alert ${hyperlink(`#${alert.tinyId}`, url)} "${alert.message}"`,
                }
            ]
        }
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

async function notifyCloseAlert(request: WebhookRequest<AlertWebhook>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const alert: AlertWebhook = request.alert;

    const kvOptions: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const kvStoreClient: KVStoreClient = new KVStoreClient(kvOptions);

    const configStore: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();

    const url: string = getAlertDetailUrl(account.data.name, alert.alertId);
    const payload: PostCreate = {
        message: '',
        channel_id: 'yhso3rs8b3d7pnyaoh63km9fir',
        props: {
            attachments: [
                {
                    text: `${alert.username} closed alert ${hyperlink(`#${alert.tinyId}`, url)} "${alert.message}"`,
                }
            ]
        }
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

async function notifyAckAlert(request: WebhookRequest<AlertWebhook>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const alert: AlertWebhook = request.alert;

    const kvOptions: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const kvStoreClient: KVStoreClient = new KVStoreClient(kvOptions);

    const configStore: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();

    const url: string = getAlertDetailUrl(account.data.name, alert.alertId);
    const payload: PostCreate = {
        message: '',
        channel_id: 'yhso3rs8b3d7pnyaoh63km9fir',
        props: {
            attachments: [
                {
                    text: `${alert.username} acknowledged alert ${hyperlink(`#${alert.tinyId}`, url)} "${alert.message}"`,
                }
            ]
        }
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

async function notifyUnackAlert(request: WebhookRequest<AlertWebhook>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const alert: AlertWebhook = request.alert;

    const kvOptions: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const kvStoreClient: KVStoreClient = new KVStoreClient(kvOptions);

    const configStore: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();

    const url: string = getAlertDetailUrl(account.data.name, alert.alertId);
    const payload: PostCreate = {
        message: '',
        channel_id: 'yhso3rs8b3d7pnyaoh63km9fir',
        props: {
            attachments: [
                {
                    text: `${alert.username} un-acknowledged alert ${hyperlink(`#${alert.tinyId}`, url)} "${alert.message}"`,
                }
            ]
        }
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

async function notifySnoozeAlert(request: WebhookRequest<SnoozeWebhook>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const alert: SnoozeWebhook = request.alert;

    const kvOptions: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const kvStoreClient: KVStoreClient = new KVStoreClient(kvOptions);

    const configStore: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();

    const url: string = getAlertDetailUrl(account.data.name, alert.alertId);
    const payload: PostCreate = {
        message: '',
        channel_id: 'yhso3rs8b3d7pnyaoh63km9fir',
        props: {
            attachments: [
                {
                    text: `${alert.username} snoozed alert ${hyperlink(`#${alert.tinyId}`, url)} "${alert.message}" until ${alert.snoozeEndDate}`,
                }
            ]
        },
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

async function notifySnoozeEndedAlert(request: WebhookRequest<AlertWebhook>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const alert: AlertWebhook = request.alert;

    const kvOptions: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const kvStoreClient: KVStoreClient = new KVStoreClient(kvOptions);

    const configStore: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();

    const url: string = getAlertDetailUrl(account.data.name, alert.alertId);
    const payload: PostCreate = {
        message: '',
        channel_id: 'yhso3rs8b3d7pnyaoh63km9fir',
        props: {
            attachments: [
                {
                    text: `Snooze expired for the alert ${hyperlink(`#${alert.tinyId}`, url)} "${alert.message}"`,
                }
            ]
        },
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

async function notifyAssignOwnershipAlert(request: WebhookRequest<AssignWebhook>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const alert: AssignWebhook = request.alert;

    const kvOptions: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const kvStoreClient: KVStoreClient = new KVStoreClient(kvOptions);

    const configStore: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();

    const identifier: Identifier = {
        identifier: alert.owner,
        identifierType: IdentifierType.USERNAME
    };
    const user: ResponseResultWithData<OpsUser> = await opsGenieClient.getUser(identifier);

    const url: string = getAlertDetailUrl(account.data.name, alert.alertId);
    const payload: PostCreate = {
        message: '',
        channel_id: 'yhso3rs8b3d7pnyaoh63km9fir',
        props: {
            attachments: [
                {
                    text: `${alert.username} assigned ownership of the alert ${hyperlink(`#${alert.tinyId}`, url)} to ${user.data.fullName} "${alert.message}"`,
                }
            ]
        }
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

async function notifyUpdatePriorityAlert(request: WebhookRequest<AssignWebhook>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const alert: AssignWebhook = request.alert;

    const kvOptions: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const kvStoreClient: KVStoreClient = new KVStoreClient(kvOptions);

    const configStore: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();

    const url: string = getAlertDetailUrl(account.data.name, alert.alertId);
    const payload: PostCreate = {
        message: '',
        channel_id: 'yhso3rs8b3d7pnyaoh63km9fir',
        props: {
            attachments: [
                {
                    text: `${alert.username} changed the priority of the alert ${hyperlink(`#${alert.tinyId}`, url)} "${alert.message}" from ${alert.oldPriority} to ${alert.priority}`,
                }
            ]
        }
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
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
    const data: WebhookRequest<any> = request.body.values.data;
    const context: AppContext = request.body.context;

    let callResponse: AppCallResponse;
    try {
        const action: Function = WEBHOOKS_ACTIONS[data.action];
        if (action) {
            await action(data, context);
        }
        callResponse = newOKCallResponse();
        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Error webhook: ' + error.message);
        response.json(callResponse);
    }
};
