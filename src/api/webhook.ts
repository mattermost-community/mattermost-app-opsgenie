import { Request, Response } from 'express';
import queryString, { ParsedQuery } from 'query-string';

import {
    Account,
    AlertWebhook,
    AppCallResponse,
    AppContext,
    AppContextAction,
    AssignWebhook,
    Identifier,
    IdentifierType,
    NoteWebhook,
    OpsUser,
    PostCreate,
    ResponseResultWithData,
    SnoozeWebhook,
    Team,
    WebhookData,
    WebhookRequest,
} from '../types';
import { newErrorCallResponseWithMessage, newOKCallResponse } from '../utils/call-responses';
import {
    ActionsEvents,
    Routes,
    StoreKeys, options_alert,
} from '../constant';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import config from '../config';
import { configureI18n } from '../utils/translations';
import { getAlertDetailUrl } from '../utils/utils';
import { hyperlink } from '../utils/markdown';
import { ConfigStoreProps, KVStoreClient, KVStoreOptions } from '../clients/kvstore';
import { WebhookFunction } from '../types/functions';

async function notifyAlertCreated(webhookRequest: WebhookRequest<AlertWebhook>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const rawQuery: string = webhookRequest.rawQuery;
    const event: WebhookData<AlertWebhook> = webhookRequest.data;
    const alert: AlertWebhook = event.alert;
    const i18nObj = configureI18n(context);

    const kvOptions: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient: KVStoreClient = new KVStoreClient(kvOptions);

    const configStore: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const teamsPromise: Promise<ResponseResultWithData<Team>>[] = alert.teams.map((teamId: string) => {
        const teamParams: Identifier = {
            identifier: teamId,
            identifierType: IdentifierType.ID,
        };
        return opsGenieClient.getTeam(teamParams);
    });
    const teams: ResponseResultWithData<Team>[] = await Promise.all(teamsPromise);
    const teamsName: string[] = teams.map((team: ResponseResultWithData<Team>) =>
        team.data.name
    );

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();
    const parsedQuery: ParsedQuery = queryString.parse(rawQuery);

    const url: string = getAlertDetailUrl(account.data.name, alert.alertId);
    const channelId: string = <string>parsedQuery.channelId;
    const payload: PostCreate = {
        message: '',
        channel_id: channelId,
        props: {
            attachments: [
                {
                    title: `#${alert.tinyId}: ${alert.message}`,
                    title_link: url,
                    fields: [
                        {
                            short: true,
                            title: i18nObj.__('api.webhook.title-priority'),
                            value: alert.priority,
                        },
                        {
                            short: true,
                            title: i18nObj.__('api.webhook.title-team'),
                            value: teamsName.join(', '),
                        },
                    ],
                    actions: [
                        {
                            id: ActionsEvents.ACKNOWLEDGED_ALERT_BUTTON_EVENT,
                            name: i18nObj.__('api.webhook.name-acknowledged'),
                            type: 'button',
                            style: 'default',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathAlertAcknowledgedAction}`,
                                context: {
                                    action: ActionsEvents.ACKNOWLEDGED_ALERT_BUTTON_EVENT,
                                    alert: {
                                        id: alert.alertId,
                                        message: alert.message,
                                        tinyId: alert.tinyId,
                                    },
                                    bot_access_token: botAccessToken,
                                    mattermost_site_url: mattermostUrl,
                                    locale: context.locale,
                                } as AppContextAction,
                            },
                        },
                        {
                            id: ActionsEvents.CLOSE_ALERT_BUTTON_EVENT,
                            name: i18nObj.__('api.webhook.name-close'),
                            type: 'button',
                            style: 'success',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathAlertCloseAction}`,
                                context: {
                                    action: ActionsEvents.CLOSE_ALERT_BUTTON_EVENT,
                                    alert: {
                                        id: alert.alertId,
                                        message: alert.message,
                                        tinyId: alert.tinyId,
                                    },
                                    bot_access_token: botAccessToken,
                                    mattermost_site_url: mattermostUrl,
                                    locale: context.locale,
                                } as AppContextAction,
                            },
                        },
                        {
                            id: ActionsEvents.OTHER_OPTIONS_SELECT_EVENT,
                            name: i18nObj.__('api.webhook.name-other'),
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathAlertOtherActions}`,
                                context: {
                                    action: ActionsEvents.OTHER_OPTIONS_SELECT_EVENT,
                                    alert: {
                                        id: alert.alertId,
                                        message: alert.message,
                                        tinyId: alert.tinyId,
                                    },
                                    bot_access_token: botAccessToken,
                                    mattermost_site_url: mattermostUrl,
                                    locale: context.locale,
                                } as AppContextAction,
                            },
                            type: 'select',
                            options: options_alert,
                        },
                    ],
                },
            ],
        },
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

async function notifyNoteCreated(webhookRequest: WebhookRequest<NoteWebhook>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const rawQuery: string = webhookRequest.rawQuery;
    const event: WebhookData<NoteWebhook> = webhookRequest.data;
    const alert: NoteWebhook = event.alert;
    const i18nObj = configureI18n(context);

    const kvOptions: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient: KVStoreClient = new KVStoreClient(kvOptions);

    const configStore: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();
    const parsedQuery: ParsedQuery = queryString.parse(rawQuery);

    const url: string = getAlertDetailUrl(account.data.name, alert.alertId);
    const channelId: string = <string>parsedQuery.channelId;
    const payload: PostCreate = {
        message: '',
        channel_id: channelId,
        props: {
            attachments: [
                {
                    text: i18nObj.__('api.webhook.message-note', { username: alert.username, note: alert.note, message: hyperlink(`#${alert.tinyId}`, url) }),
                },
            ],
        },
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

async function notifyCloseAlert(webhookRequest: WebhookRequest<AlertWebhook>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const rawQuery: string = webhookRequest.rawQuery;
    const event: WebhookData<AlertWebhook> = webhookRequest.data;
    const alert: AlertWebhook = event.alert;
    const i18nObj = configureI18n(context);

    const kvOptions: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient: KVStoreClient = new KVStoreClient(kvOptions);

    const configStore: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();
    const parsedQuery: ParsedQuery = queryString.parse(rawQuery);

    const url: string = getAlertDetailUrl(account.data.name, alert.alertId);
    const channelId: string = <string>parsedQuery.channelId;
    const payload: PostCreate = {
        message: '',
        channel_id: channelId,
        props: {
            attachments: [
                {
                    text: i18nObj.__('api.webhook.message-notify', { username: alert.username, url: hyperlink(`#${alert.tinyId}`, url), message: alert.message }),
                },
            ],
        },
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

async function notifyAckAlert(webhookRequest: WebhookRequest<AlertWebhook>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const rawQuery: string = webhookRequest.rawQuery;
    const event: WebhookData<AlertWebhook> = webhookRequest.data;
    const alert: AlertWebhook = event.alert;
    const i18nObj = configureI18n(context);

    const kvOptions: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient: KVStoreClient = new KVStoreClient(kvOptions);

    const configStore: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();
    const parsedQuery: ParsedQuery = queryString.parse(rawQuery);

    const url: string = getAlertDetailUrl(account.data.name, alert.alertId);
    const channelId: string = <string>parsedQuery.channelId;
    const payload: PostCreate = {
        message: '',
        channel_id: channelId,
        props: {
            attachments: [
                {
                    text: i18nObj.__('api.webhook.message-notify-ack', { username: alert.username, url: hyperlink(`#${alert.tinyId}`, url), message: alert.message }),
                },
            ],
        },
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

async function notifyUnackAlert(webhookRequest: WebhookRequest<AlertWebhook>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const rawQuery: string = webhookRequest.rawQuery;
    const event: WebhookData<AlertWebhook> = webhookRequest.data;
    const alert: AlertWebhook = event.alert;
    const i18nObj = configureI18n(context);

    const kvOptions: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient: KVStoreClient = new KVStoreClient(kvOptions);

    const configStore: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();
    const parsedQuery: ParsedQuery = queryString.parse(rawQuery);

    const url: string = getAlertDetailUrl(account.data.name, alert.alertId);
    const channelId: string = <string>parsedQuery.channelId;
    const payload: PostCreate = {
        message: '',
        channel_id: channelId,
        props: {
            attachments: [
                {
                    text: i18nObj.__('api.webhook.message-notify-unack', { username: alert.username, url: hyperlink(`#${alert.tinyId}`, url), message: alert.message }),
                },
            ],
        },
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

async function notifySnoozeAlert(webhookRequest: WebhookRequest<SnoozeWebhook>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const rawQuery: string = webhookRequest.rawQuery;
    const event: WebhookData<SnoozeWebhook> = webhookRequest.data;
    const alert: SnoozeWebhook = event.alert;
    const i18nObj = configureI18n(context);

    const kvOptions: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient: KVStoreClient = new KVStoreClient(kvOptions);

    const configStore: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();
    const parsedQuery: ParsedQuery = queryString.parse(rawQuery);

    const url: string = getAlertDetailUrl(account.data.name, alert.alertId);
    const channelId: string = <string>parsedQuery.channelId;
    const payload: PostCreate = {
        message: '',
        channel_id: channelId,
        props: {
            attachments: [
                {
                    text: i18nObj.__('api.webhook.message-snooze', { username: alert.username, url: hyperlink(`#${alert.tinyId}`, url), date: alert.snoozeEndDate }),
                },
            ],
        },
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

async function notifySnoozeEndedAlert(webhookRequest: WebhookRequest<AlertWebhook>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const rawQuery: string = webhookRequest.rawQuery;
    const event: WebhookData<AlertWebhook> = webhookRequest.data;
    const alert: AlertWebhook = event.alert;
    const i18nObj = configureI18n(context);

    const kvOptions: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient: KVStoreClient = new KVStoreClient(kvOptions);

    const configStore: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();
    const parsedQuery: ParsedQuery = queryString.parse(rawQuery);

    const url: string = getAlertDetailUrl(account.data.name, alert.alertId);
    const channelId: string = <string>parsedQuery.channelId;
    const payload: PostCreate = {
        message: '',
        channel_id: channelId,
        props: {
            attachments: [
                {
                    text: i18nObj.__('api.webhook.message-snooze-alert', { url: hyperlink(`#${alert.tinyId}`, url), message: alert.message }),
                },
            ],
        },
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

async function notifyAssignOwnershipAlert(webhookRequest: WebhookRequest<AssignWebhook>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const rawQuery: string = webhookRequest.rawQuery;
    const event: WebhookData<AssignWebhook> = webhookRequest.data;
    const alert: AssignWebhook = event.alert;
    const i18nObj = configureI18n(context);

    const kvOptions: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient: KVStoreClient = new KVStoreClient(kvOptions);

    const configStore: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();
    const parsedQuery: ParsedQuery = queryString.parse(rawQuery);

    const identifier: Identifier = {
        identifier: alert.owner,
        identifierType: IdentifierType.USERNAME,
    };
    const user: ResponseResultWithData<OpsUser> = await opsGenieClient.getUser(identifier);

    const url: string = getAlertDetailUrl(account.data.name, alert.alertId);
    const channelId: string = <string>parsedQuery.channelId;
    const payload: PostCreate = {
        message: '',
        channel_id: channelId,
        props: {
            attachments: [
                {
                    text: i18nObj.__('api.webhook.message-assign', { username: alert.username, url: hyperlink(`#${alert.tinyId}`, url), fullName: user.data.fullName, message: alert.message }),
                },
            ],
        },
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

async function notifyUpdatePriorityAlert(webhookRequest: WebhookRequest<AssignWebhook>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const rawQuery: string = webhookRequest.rawQuery;
    const event: WebhookData<AssignWebhook> = webhookRequest.data;
    const alert: AssignWebhook = event.alert;
    const i18nObj = configureI18n(context);

    const kvOptions: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient: KVStoreClient = new KVStoreClient(kvOptions);

    const configStore: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const account: ResponseResultWithData<Account> = await opsGenieClient.getAccount();
    const parsedQuery: ParsedQuery = queryString.parse(rawQuery);

    const url: string = getAlertDetailUrl(account.data.name, alert.alertId);
    const channelId: string = <string>parsedQuery.channelId;
    const payload: PostCreate = {
        message: '',
        channel_id: channelId,
        props: {
            attachments: [
                {
                    text: i18nObj.__('api.webhook.message-update', { username: alert.username, url: hyperlink(`#${alert.tinyId}`, url), message: alert.message, oldPriority: alert.oldPriority, priority: alert.priority }),
                },
            ],
        },
    };

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    await mattermostClient.createPost(payload);
}

const WEBHOOKS_ACTIONS: { [key: string]: WebhookFunction } = {
    Create: notifyAlertCreated,
    AddNote: notifyNoteCreated,
    Close: notifyCloseAlert,
    Acknowledge: notifyAckAlert,
    UnAcknowledge: notifyUnackAlert,
    Snooze: notifySnoozeAlert,
    SnoozeEnded: notifySnoozeEndedAlert,
    AssignOwnership: notifyAssignOwnershipAlert,
    UpdatePriority: notifyUpdatePriorityAlert,
};

export const incomingWebhook = async (request: Request, response: Response) => {
    const webhookRequest: WebhookRequest<any> = request.body.values;
    const context: AppContext = request.body.context;
    const i18nObj = configureI18n(context);

    let callResponse: AppCallResponse;
    try {
        //console.log('data', webhookRequest.data);
        const action: WebhookFunction = WEBHOOKS_ACTIONS[webhookRequest.data.action];
        if (action) {
            await action(webhookRequest, context);
        }
        callResponse = newOKCallResponse();
        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage(i18nObj.__('api.webhook.error', { message: error.message }));
        response.json(callResponse);
    }
};
