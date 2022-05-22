import {
    AppCallAction,
    CloseAlertAction,
    DialogProps, PostCreate,
} from '../types';
import {MattermostClient, MattermostOptions} from '../clients/mattermost';
import {Actions, options_times, Routes} from '../constant';
import config from '../config';

async function showModalNoteToAlert(call: AppCallAction<CloseAlertAction>): Promise<void> {
    const mattermostUrl: string = call.context.mattermost_site_url;
    const triggerId: string = call.trigger_id;
    const accessToken: string = call.context.bot_access_token;

    const mattermostOptions: MattermostOptions = {
        mattermostUrl,
        accessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    const url: string = `${config.APP.HOST}${Routes.App.CallPathNoteToAlertModal}`;
    const dialogProps: DialogProps = {
        trigger_id: triggerId,
        url,
        dialog: {
            title: 'Add Note',
            elements: [
                {
                    display_name: 'Note',
                    type: 'textarea',
                    name: 'note',
                    placeholder: 'Your note here...',
                    optional: false
                }
            ],
        }
    }
    await mattermostClient.showDialog(dialogProps);
}

async function showPostOfListUsers(call: AppCallAction<CloseAlertAction>): Promise<void> {
    const mattermostUrl: string = call.context.mattermost_site_url;
    const mattermostUrlByUrl: string = `${call.context.mattermost_site_url}${Routes.Mattermost.ApiVersionV4}${Routes.Mattermost.PostsPath}`;
    const channelId: string = call.channel_id;
    const accessToken: string = call.context.bot_access_token;

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: mattermostUrlByUrl,
        accessToken: <string>accessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    const postCreate: PostCreate = {
        channel_id: channelId,
        message: '',
        props: {
            attachments: [
                {
                    title: `Choose a user to assign the alert to`,
                    actions: [
                        {
                            id: Actions.USER_SELECT_EVENT,
                            name: "Choose a user",
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathAlertOtherActions}`,
                                context: {
                                    action: Actions.USER_SELECT_EVENT,
                                    bot_access_token: call.context.bot_access_token,
                                    mattermost_site_url: mattermostUrl
                                } as CloseAlertAction
                            },
                            type: "select",
                            data_source: 'users'
                        },
                        {
                            id: Actions.CANCEL_BUTTON_EVENT,
                            name: 'Close',
                            type: 'button',
                            style: 'default',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathCloseOptions}`,
                                context: {
                                    action: Actions.CANCEL_BUTTON_EVENT,
                                    bot_access_token: call.context.bot_access_token,
                                    mattermost_site_url: mattermostUrl
                                } as CloseAlertAction
                            }
                        }
                    ]
                }
            ]
        }
    };
    await mattermostClient.createPost(postCreate);
}

async function showPostOfTimes(call: AppCallAction<CloseAlertAction>): Promise<void> {
    const mattermostUrl: string = call.context.mattermost_site_url;
    const mattermostUrlByApi: string = `${call.context.mattermost_site_url}${Routes.Mattermost.ApiVersionV4}${Routes.Mattermost.PostsPath}`;
    const channelId: string = call.channel_id;
    const accessToken: string = call.context.bot_access_token;

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: mattermostUrlByApi,
        accessToken: <string>accessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    const postCreate: PostCreate = {
        channel_id: channelId,
        message: '',
        props: {
            attachments: [
                {
                    title: `For how long do you want to snooze notifications for this alert`,
                    actions: [
                        {
                            id: Actions.TIME_SELECT_EVENT,
                            name: "Choose snooze time",
                            type: "select",
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathAlertOtherActions}`,
                                context: {
                                    action: "do_something",
                                    bot_access_token: call.context.bot_access_token,
                                    mattermost_site_url: mattermostUrl
                                } as CloseAlertAction
                            },
                            options: options_times
                        },
                        {
                            id: Actions.CANCEL_BUTTON_EVENT,
                            name: 'Close',
                            type: 'button',
                            style: 'default',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathCloseOptions}`,
                                context: {
                                    action: Actions.CANCEL_BUTTON_EVENT,
                                    bot_access_token: call.context.bot_access_token,
                                    mattermost_site_url: mattermostUrl
                                } as CloseAlertAction
                            }
                        }
                    ]
                }
            ]
        }
    };
    await mattermostClient.createPost(postCreate);
}

export async function otherActionsAlertCall(call: AppCallAction<CloseAlertAction>): Promise<void> {
    console.log('call', call);
    await showPostOfTimes(call);
}
