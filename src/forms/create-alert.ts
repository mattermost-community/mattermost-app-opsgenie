import {
    Alert,
    AlertCreate,
    AppCallRequest,
    ListAlertParams,
    PostCreate,
    ResponseResultWithData,
    Team,
    Identifier, CloseAlertAction
} from '../types';
import {OpsGenieClient, OpsGenieClientOptions} from '../clients/opsgenie';
import {MattermostClient, MattermostOptions} from '../clients/mattermost';
import {Routes} from '../constant';
import config from '../config';

export async function newCreateAlertForm(call: AppCallRequest): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const mattermostForApiPost: string = `${mattermostUrl}${Routes.Mattermost.ApiVersionV4}${Routes.Mattermost.PostsPath}`;
    const channelId: string = call.context.channel.id;
    const accessToken: string | undefined = call.context.bot_access_token;

    const opsgenieOptions: OpsGenieClientOptions = {
        oauth2UserAccessToken: ''
    };

    const opsGenieClient = new OpsGenieClient(opsgenieOptions);

    const message: string = call.values?.message;
    const alertCreate: AlertCreate = {
        message
    };
    await opsGenieClient.createAlert(alertCreate);

    const alertParams: ListAlertParams = {
        query: 'status: open',
        limit: 1,
        offset: 0,
        sort: 'tinyId',
        order: 'desc'
    };
    const alerts: ResponseResultWithData<Alert[]> = await opsGenieClient.listAlert(alertParams);
    const alert: Alert = alerts.data[0];

    const teamsPromise: Promise<ResponseResultWithData<Team>>[] = alert.teams.map((team) => {
        const teamParams: Identifier = {
            identifier: team.id,
            identifierType: 'id'
        };
        return opsGenieClient.getTeam(teamParams);
    });
    const teams: ResponseResultWithData<Team>[] = await Promise.all(teamsPromise);
    const teamsName: string[] = teams.map((team: ResponseResultWithData<Team>) =>
        team.data.name
    );

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: mattermostForApiPost,
        accessToken: <string>accessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    const postCreate: PostCreate = {
        channel_id: channelId,
        message: '',
        props: {
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
                        {
                            id: 'acknowledge',
                            name: 'Acknowledge',
                            type: 'button',
                            style: 'default',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathAlertClose}`,
                                context: {
                                    action: "do_something",
                                    alert: {
                                        id: alert.id,
                                        message: alert.message,
                                        tinyId: alert.tinyId
                                    },
                                    bot_access_token: call.context.bot_access_token,
                                    mattermost_site_url: mattermostUrl
                                } as CloseAlertAction
                            }
                        },
                        {
                            id: 'close_alert',
                            name: 'Close',
                            type: 'button',
                            style: 'success',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathAlertClose}`,
                                context: {
                                    action: "do_something",
                                    alert: {
                                        id: alert.id,
                                        message: alert.message,
                                        tinyId: alert.tinyId
                                    },
                                    bot_access_token: call.context.bot_access_token,
                                    mattermost_site_url: mattermostUrl
                                } as CloseAlertAction
                            }
                        },
                        {
                            id: "action_options",
                            name: "Other actions...",
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathAlertClose}`,
                                context: {
                                    action: "do_something",
                                    alert: {
                                        id: alert.id,
                                        message: alert.message,
                                        tinyId: alert.tinyId
                                    },
                                    bot_access_token: call.context.bot_access_token,
                                    mattermost_site_url: mattermostUrl
                                } as CloseAlertAction
                            },
                            type: "select",
                            options: [
                                {
                                    text: "Assign",
                                    value: "assign"
                                },
                                {
                                    text: "Take Ownership",
                                    value: "take_ownership"
                                },
                                {
                                    text: "Snooze",
                                    value: "snooze"
                                },
                                {
                                    text: "Add note",
                                    value: "add_note"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    };
    await mattermostClient.createPost(postCreate);
}
