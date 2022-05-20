import {
    AppCallAction,
    CloseAlertAction,
    DialogProps, PostCreate,
} from '../types';
import {MattermostClient, MattermostOptions} from '../clients/mattermost';
import {Routes} from '../constant';
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
                            id: "actionoptions",
                            name: "Choose a user",
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathAlertOtherActions}`,
                                context: {
                                    action: "do_something",
                                    bot_access_token: call.context.bot_access_token,
                                    mattermost_site_url: mattermostUrl
                                } as CloseAlertAction
                            },
                            type: "select",
                            data_source: 'users'
                        },
                        {
                            id: 'canceluser',
                            name: 'Close',
                            type: 'button',
                            style: 'default',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathCloseOptions}`,
                                context: {
                                    action: "do_something",
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
                            id: "actionoptions",
                            name: "Choose snooze time",
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathAlertOtherActions}`,
                                context: {
                                    action: "do_something",
                                    bot_access_token: call.context.bot_access_token,
                                    mattermost_site_url: mattermostUrl
                                } as CloseAlertAction
                            },
                            type: "select",
                            options: [
                                {
                                    text: "5 min.",
                                    value: "5m"
                                },
                                {
                                    text: "10 min.",
                                    value: "10m"
                                },
                                {
                                    text: "15 min.",
                                    value: "15m"
                                },
                                {
                                    text: "30 min.",
                                    value: "30m"
                                },
                                {
                                    text: "1 hour.",
                                    value: "1h"
                                },
                                {
                                    text: "2 hours.",
                                    value: "2h"
                                },
                                {
                                    text: "6 hours.",
                                    value: "6h"
                                },
                                {
                                    text: "1 day.",
                                    value: "1d"
                                }
                            ]
                        },
                        {
                            id: 'canceluser',
                            name: 'Close',
                            type: 'button',
                            style: 'default',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathCloseOptions}`,
                                context: {
                                    action: "do_something",
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
