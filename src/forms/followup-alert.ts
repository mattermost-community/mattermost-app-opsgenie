import {
    Alert,
    AppCallAction,
    AttachmentAction,
    AttachmentOption,
    CloseAlertAction,
    Identifier,
    IdentifierType,
    PostCreate,
    PostUpdate,
    ResponseResultWithData,
    Team
} from '../types';
import {Actions, options_alert, Routes} from '../constant';
import {OpsGenieClient} from '../clients/opsgenie';
import {hyperlink} from '../utils/markdown';
import {MattermostClient, MattermostOptions} from '../clients/mattermost';
import config from '../config';

export async function followupAlertCall(call: AppCallAction<CloseAlertAction>): Promise<void> {
    const mattermostUrl: string = call.context.mattermost_site_url;
    const channelId: string = call.channel_id;
    const accessToken: string = call.context.bot_access_token;
    const postId: string = call.post_id;
    const alertTinyId: string = call.context.alert.tinyId;

    const opsGenieClient = new OpsGenieClient();

    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY
    }
    const response: ResponseResultWithData<Alert> = await opsGenieClient.getAlert(identifier);
    const alert: Alert = response.data;

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

    alert.acknowledged
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

    const followupAlertAction: AttachmentAction = alert.acknowledged
        ? {
            id: Actions.UNACKNOWLEDGE_ALERT_BUTTON_EVENT,
            name: 'Unacknowledge',
            type: 'button',
            style: 'default',
            integration: {
                url: `${config.APP.HOST}${Routes.App.CallPathAlertUnacknowledge}`,
                context: {
                    action: Actions.UNACKNOWLEDGE_ALERT_BUTTON_EVENT,
                    alert: {
                        id: alert.id,
                        message: alert.message,
                        tinyId: alert.tinyId
                    },
                    bot_access_token: call.context.bot_access_token,
                    mattermost_site_url: mattermostUrl
                } as CloseAlertAction
            }
        }
        : {
            id: Actions.ACKNOWLEDGED_ALERT_BUTTON_EVENT,
            name: 'Acknowledged',
            type: 'button',
            style: 'default',
            integration: {
                url: `${config.APP.HOST}${Routes.App.CallPathAlertAcknowledged}`,
                context: {
                    action: Actions.ACKNOWLEDGED_ALERT_BUTTON_EVENT,
                    alert: {
                        id: alert.id,
                        message: alert.message,
                        tinyId: alert.tinyId
                    },
                    bot_access_token: call.context.bot_access_token,
                    mattermost_site_url: mattermostUrl
                } as CloseAlertAction
            }
        };

    const optionsFollowup: AttachmentOption[] = options_alert.filter((opt: AttachmentOption) =>
        alert.acknowledged && opt.value !== 'take_ownership'
    );

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
                        followupAlertAction,
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
                            options: optionsFollowup
                        }
                    ]
                }
            ]
        }
    };
    await mattermostClient.updatePost(postId, postUpdate);
}
