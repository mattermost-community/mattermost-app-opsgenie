import {
    Alert,
    AlertAssign,
    AppCallAction,
    AppCallResponse, AppContext,
    AppContextAction,
    AppForm,
    DialogProps,
    Identifier,
    IdentifierType,
    PostCreate,
    PostEphemeralCreate,
    ResponseResultWithData,
    User,
} from '../types';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';
import {
    ActionsEvents,
    ExceptionType,
    NoteModalForm,
    Routes,
    StoreKeys,
    option_alert_add_note,
    option_alert_assign,
    option_alert_snooze,
    option_alert_take_ownership,
    options_times,
    AppExpandLevels,
    AppFieldTypes,
    ConfigureForm,
    OpsGenieIcon,
    AppFieldSubTypes,
} from '../constant';
import config from '../config';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { configureI18n } from '../utils/translations';
import { tryPromise } from '../utils/utils';
import { ConfigStoreProps, KVStoreClient, KVStoreOptions } from '../clients/kvstore';
import { Exception } from '../utils/exception';
import { OtherActionsFunction } from '../types/functions';

async function showModalNoteToAlert(call: AppCallAction<AppContextAction>): Promise<AppForm> {
    const i18nObj = configureI18n(call.context);

    const form: AppForm = {
        title: i18nObj.__('forms.actions.title-note', { alert: call.state.alert.tinyId }),
        icon: OpsGenieIcon,
        fields: [
            {
                type: AppFieldTypes.TEXT,
                subtype: AppFieldSubTypes.TEXTAREA,
                name: NoteModalForm.NOTE_MESSAGE,
                modal_label: i18nObj.__('forms.actions.display-note'),
                is_required: true, 
                max_length: 250,
            },
        ],
        submit: {
            path: Routes.App.CallPathNoteToAlertAction,
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                acting_user_access_token: AppExpandLevels.EXPAND_SUMMARY,
                locale: AppExpandLevels.EXPAND_ALL
            },
            state: call.state
        },
    };
    return form;
}

async function showPostOfListUsers(call: AppCallAction<AppContextAction>): Promise<AppForm> {
    const i18nObj = configureI18n(call.context);
    
    const form: AppForm = {
        title: i18nObj.__('forms.actions.title-list-user'),
        icon: OpsGenieIcon,
        fields: [
            {
                type: AppFieldTypes.USER,
                name: ActionsEvents.USER_SELECT_EVENT,
                modal_label: i18nObj.__('forms.actions.name-list-user'),
                is_required: true,
            },
        ],
        submit: {
            path: Routes.App.CallPathAssignAlertAction,
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                acting_user_access_token: AppExpandLevels.EXPAND_SUMMARY,
                locale: AppExpandLevels.EXPAND_ALL
            },
            state: call.state
        },
    };
    return form;
}

async function showPostOfTimes(call: AppCallAction<AppContextAction>): Promise<void> {
    const mattermostUrl: string = call.context.mattermost_site_url;
    const channelId: string = call.context.post.channel_id;
    const accessToken: string = call.context.bot_access_token;
    const i18nObj = configureI18n(call.context);

    const mattermostOptions: MattermostOptions = {
        mattermostUrl,
        accessToken: <string>accessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    const postCreate: PostCreate = {
        channel_id: channelId,
        message: '',
        props: {
            attachments: [
                {
                    title: i18nObj.__('forms.actions.title-snooze'),
                    actions: [
                        {
                            id: ActionsEvents.TIME_SELECT_EVENT,
                            name: i18nObj.__('forms.actions.name-snooze'),
                            type: 'select',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathSnoozeAlertAction}`,
                                context: {
                                    action: ActionsEvents.TIME_SELECT_EVENT,
                                    bot_access_token: call.context.bot_access_token,
                                    mattermost_site_url: mattermostUrl,
                                    alert: call.context.alert,
                                    locale: call.context.locale,
                                } as AppContextAction,
                            },
                            options: options_times,
                        },
                        {
                            id: ActionsEvents.CANCEL_BUTTON_EVENT,
                            name: i18nObj.__('forms.actions.name-close'),
                            type: 'button',
                            style: 'default',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathCloseOptions}`,
                                context: {
                                    action: ActionsEvents.CANCEL_BUTTON_EVENT,
                                    bot_access_token: call.context.bot_access_token,
                                    mattermost_site_url: mattermostUrl,
                                    locale: call.context.locale,
                                } as AppContextAction,
                            },
                        },
                    ],
                },
            ],
        },
    };
    await mattermostClient.createPost(postCreate);
}

async function showPostTakeOwnership(call: AppCallAction<AppContextAction>): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const channelId: string | undefined = call.context.post.channel_id;
    const userId: string | undefined = call.context.acting_user.id;
    let message: string;
    const i18nObj = configureI18n(call.context);

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };

    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    try {
        const alertTinyId: string = call.context.alert.tinyId;
        const username: string | undefined = call.context.acting_user.username;
        const options: KVStoreOptions = {
            mattermostUrl: <string>mattermostUrl,
            accessToken: <string>botAccessToken,
        };
        const kvStoreClient = new KVStoreClient(options);

        const kvConfig: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);
        const opsGenieOpt: OpsGenieOptions = {
            api_key: kvConfig.opsgenie_apikey,
        };
        const opsGenieClient = new OpsGenieClient(opsGenieOpt);

        const mattermostUser: User = await mattermostClient.getUser(<string>userId);

        const identifierUser: Identifier = {
            identifier: mattermostUser.email,
            identifierType: IdentifierType.USERNAME,
        };

        await tryPromise(opsGenieClient.getUser(identifierUser), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));

        const identifier: Identifier = {
            identifier: alertTinyId,
            identifierType: IdentifierType.TINY,
        };
        const responseAlert: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
        const alert: Alert = responseAlert.data;

        if (alert.owner === mattermostUser.email) {
            throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.actions.exception-owner', { alert: alert.tinyId }));
        }

        const data: AlertAssign = {
            user: username,
            owner: {
                username: mattermostUser.email,
            },
        };

        await tryPromise(opsGenieClient.assignAlert(identifier, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));

        message = i18nObj.__('forms.actions.response-owner', { alert: alert.tinyId });
    } catch (error: any) {
        message = i18nObj.__('forms.error-ack', { message: error.message });
    }

    const post: PostEphemeralCreate = {
        post: {
            message,
            channel_id: channelId,
        },
        user_id: userId
    };
    await mattermostClient.createEphemeralPost(post);
}

const ACTIONS_EVENT: { [key: string]: OtherActionsFunction } = {
    [option_alert_assign]: showPostOfListUsers,
    [option_alert_add_note]: showModalNoteToAlert,
    [option_alert_take_ownership]: showPostTakeOwnership,
    [option_alert_snooze]: showPostOfTimes,
};

export async function otherActionsAlertCall(call: AppCallAction<AppContextAction>): Promise<AppForm | void> {
    const selectedOption: string = call.state.action;

    const handle: OtherActionsFunction = ACTIONS_EVENT[selectedOption];
    if (handle && typeof handle === 'function') {
        return await handle(call);
    }
}
