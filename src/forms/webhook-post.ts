import queryString, { ParsedQuery } from 'query-string';

import { ConfigStoreProps, KVStoreClient, KVStoreOptions } from '../clients/kvstore';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { ActionsEvents, AppExpandLevels, ExtraOptionsEvents, Routes, StoreKeys } from '../constant';
import { Account, AlertWebhook, AppContext, AssignWebhook, Identifier, IdentifierType, Manifest, NoteWebhook, OpsUser, PostCreate, ResponseResultWithData, SnoozeWebhook, Team, WebhookData, WebhookRequest } from '../types';
import { h6, hyperlink } from '../utils/markdown';
import { configureI18n } from '../utils/translations';
import { getAlertDetailUrl } from '../utils/utils';
import manifest from '../manifest.json';

export async function notifyAlertCreated(webhookRequest: WebhookRequest<AlertWebhook>, context: AppContext) {
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const rawQuery: string = webhookRequest.rawQuery;
    const event: WebhookData<AlertWebhook> = webhookRequest.data;
    const alert: AlertWebhook = event.alert;
    const i18nObj = configureI18n(context);
    const m: Manifest = manifest;
    const state = {
        alert: {
            id: alert.alertId,
            message: alert.message,
            tinyId: alert.tinyId,
        },
    };

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
            app_bindings: [
                {
                    app_id: m.app_id,
                    location: 'embedded',
                    description: h6(i18nObj.__('api.webhook.title', { text: `${alert.tinyId}: ${alert.message}`, url })),
                    bindings: [
                        {
                            location: ActionsEvents.ACKNOWLEDGED_ALERT_BUTTON_EVENT,
                            label: i18nObj.__('api.webhook.name-acknowledged'),
                            submit: {
                                path: Routes.App.CallPathAlertAcknowledgedAction,
                                expand: {
                                    acting_user: AppExpandLevels.EXPAND_ALL,
                                    acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                                    post: AppExpandLevels.EXPAND_SUMMARY,
                                },
                                state,
                            },
                        },
                        {
                            location: ActionsEvents.CLOSE_ALERT_BUTTON_EVENT,
                            label: i18nObj.__('api.webhook.name-close'),
                            submit: {
                                path: Routes.App.CallPathAlertCloseAction,
                                expand: {
                                    acting_user: AppExpandLevels.EXPAND_ALL,
                                    acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                                    post: AppExpandLevels.EXPAND_SUMMARY,
                                },
                                state,
                            },
                        },
                        {
                            location: ActionsEvents.OTHER_OPTIONS_SELECT_EVENT,
                            label: i18nObj.__('api.webhook.name-other'),
                            bindings: [
                                {
                                    location: ExtraOptionsEvents.ALERT_ADD_NOTE,
                                    label: i18nObj.__('api.webhook.extra-options.add-note'),
                                    submit: {
                                        path: Routes.App.CallPathAlertOtherActions,
                                        expand: {
                                            acting_user: AppExpandLevels.EXPAND_ALL,
                                            acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                                            post: AppExpandLevels.EXPAND_SUMMARY,
                                        },
                                        state: {
                                            ...state,
                                            action: ExtraOptionsEvents.ALERT_ADD_NOTE,
                                        },
                                    },
                                },
                                {
                                    location: ExtraOptionsEvents.ALERT_ASSIGN,
                                    label: i18nObj.__('api.webhook.extra-options.assign'),
                                    submit: {
                                        path: Routes.App.CallPathAlertOtherActions,
                                        expand: {
                                            acting_user: AppExpandLevels.EXPAND_ALL,
                                            acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                                            post: AppExpandLevels.EXPAND_SUMMARY,
                                        },
                                        state: {
                                            ...state,
                                            action: ExtraOptionsEvents.ALERT_ASSIGN,
                                        },
                                    },
                                },
                                {
                                    location: ExtraOptionsEvents.ALERT_SNOOZE,
                                    label: i18nObj.__('api.webhook.extra-options.snooze'),
                                    submit: {
                                        path: Routes.App.CallPathAlertOtherActions,
                                        expand: {
                                            acting_user: AppExpandLevels.EXPAND_ALL,
                                            acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                                            post: AppExpandLevels.EXPAND_SUMMARY,
                                        },
                                        state: {
                                            ...state,
                                            action: ExtraOptionsEvents.ALERT_SNOOZE,
                                        },
                                    },
                                },
                                {
                                    location: ExtraOptionsEvents.ALERT_TAKE_OWNERSHIP,
                                    label: i18nObj.__('api.webhook.extra-options.take-ownership'),
                                    submit: {
                                        path: Routes.App.CallPathAlertOtherActions,
                                        expand: {
                                            acting_user: AppExpandLevels.EXPAND_ALL,
                                            acting_user_access_token: AppExpandLevels.EXPAND_ALL,
                                            post: AppExpandLevels.EXPAND_SUMMARY,
                                        },
                                        state: {
                                            ...state,
                                            action: ExtraOptionsEvents.ALERT_TAKE_OWNERSHIP,
                                        },
                                    },
                                },
                            ],
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
    console.log(payload);
    await mattermostClient.createPost(payload);
}

export async function notifyNoteCreated(webhookRequest: WebhookRequest<NoteWebhook>, context: AppContext) {
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

export async function notifyCloseAlert(webhookRequest: WebhookRequest<AlertWebhook>, context: AppContext) {
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

export async function notifyAckAlert(webhookRequest: WebhookRequest<AlertWebhook>, context: AppContext) {
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

export async function notifyUnackAlert(webhookRequest: WebhookRequest<AlertWebhook>, context: AppContext) {
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

export async function notifySnoozeAlert(webhookRequest: WebhookRequest<SnoozeWebhook>, context: AppContext) {
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

export async function notifySnoozeEndedAlert(webhookRequest: WebhookRequest<AlertWebhook>, context: AppContext) {
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

export async function notifyAssignOwnershipAlert(webhookRequest: WebhookRequest<AssignWebhook>, context: AppContext) {
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

export async function notifyUpdatePriorityAlert(webhookRequest: WebhookRequest<AssignWebhook>, context: AppContext) {
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
