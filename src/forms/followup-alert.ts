import {
    Alert,
    AppCallAction,
    CloseAlertAction,
    Identifier,
    PostCreate,
    PostUpdate,
    ResponseResultWithData,
    Team
} from '../types';
import {Routes} from '../constant';
import {OpsGenieClient, OpsGenieClientOptions} from "../clients/opsgenie";
import {hyperlink} from "../utils/markdown";
import {MattermostClient, MattermostOptions} from "../clients/mattermost";
import config from "../config";

export async function followupAlertCall(call: AppCallAction<CloseAlertAction>): Promise<void> {
    const mattermostUrl: string = `${call.context.mattermost_site_url}${Routes.Mattermost.ApiVersionV4}${Routes.Mattermost.PostsPath}`;
    const channelId: string = call.channel_id;
    const accessToken: string = call.context.bot_access_token;
    const postId: string = call.post_id;

    const opsgenieOptions: OpsGenieClientOptions = {
        oauth2UserAccessToken: ''
    };
    const opsGenieClient = new OpsGenieClient(opsgenieOptions);

    const alertTinyId: string = call.context.alert.tinyId;
    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: 'tiny'
    }
    const response: ResponseResultWithData<Alert> = await opsGenieClient.getAlert(identifier);
    const alert: Alert = response.data;

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

    const result = alert.acknowledged
        ? await opsGenieClient.unacknowledgeAlert(identifier)
        : await opsGenieClient.acknowledgeAlert(identifier);

    const mattermostOptions: MattermostOptions = {
        mattermostUrl,
        accessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    const message: string = !alert.acknowledged
        ? `${alert.source} acknowledged alert ${hyperlink(`#${alert.tinyId}`, `https://testancient.app.opsgenie.com/alert/detail/${alert.id}`)}: "${alert.message}"`
        : `${alert.source} un-acknowledged alert ${hyperlink(`#${alert.tinyId}`, `https://testancient.app.opsgenie.com/alert/detail/${alert.id}`)}: "${alert.message}"`;
    const postCreate: PostCreate = {
        channel_id: channelId,
        message: '',
        props: {
            attachments: [
                {
                    text: message
                }
            ]
        }
    };
    await mattermostClient.createPost(postCreate);

    const actionId: string = !alert.acknowledged
        ? 'unacknowledge'
        : 'acknowledged';
    const actionName: string = !alert.acknowledged
        ? 'Unacknowledge'
        : 'Acknowledged';
    const actionUrl: string = !alert.acknowledged
        ? `${config.APP.HOST}${Routes.App.CallPathAlertUnacknowledge}`
        : `${config.APP.HOST}${Routes.App.CallPathAlertAcknowledged}`;
    const action: string = !alert.acknowledged
        ? 'unacknowledge'
        : 'acknowledged';
    const options: any[] = [
        {
            text: "Assign",
            value: "assign"
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
    if (!alert.acknowledged) {
        options.push({
            text: "Take Ownership",
            value: "take_ownership"
        });
    }

    const postUpdate: PostUpdate = {
        id: postId,
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
                            id: actionId,
                            name: actionName,
                            type: 'button',
                            style: 'default',
                            integration: {
                                url: actionUrl,
                                context: {
                                    action,
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
                            id: 'closealert',
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
                            id: "actionoptions",
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
                            options
                        }
                    ]
                }
            ]
        }
    };
    await mattermostClient.updatePost(postId, postUpdate);
}
