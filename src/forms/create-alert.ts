import {
    Alert,
    AlertCreate,
    AppCallRequest,
    ListAlertParams,
    PostCreate,
    ResponseResultWithData,
    Team,
    Identifier,
    CloseAlertAction,
    AttachmentAction,
    AttachmentOption,
    IdentifierType
} from '../types';
import {OpsGenieClient} from '../clients/opsgenie';
import {MattermostClient, MattermostOptions} from '../clients/mattermost';
import {Actions, option_alert_take_ownership, options_alert, Routes} from '../constant';
import config from '../config';

export async function newCreateAlertForm(call: AppCallRequest): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const channelId: string = call.context.channel.id;
    const accessToken: string | undefined = call.context.bot_access_token;
    const message: string = call.values?.message;

    const opsGenieClient = new OpsGenieClient();

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
            identifierType: IdentifierType.ID
        };
        return opsGenieClient.getTeam(teamParams);
    });
    const teams: ResponseResultWithData<Team>[] = await Promise.all(teamsPromise);
    const teamsName: string[] = teams.map((team: ResponseResultWithData<Team>) =>
        team.data.name
    );

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>accessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

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

    const optionsFollowup: AttachmentOption[] = alert.acknowledged
        ? options_alert
        : options_alert.filter((opt: AttachmentOption) =>
            opt.value !== option_alert_take_ownership
        );

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
                        followupAlertAction,
                        {
                            id: Actions.CLOSE_ALERT_BUTTON_EVENT,
                            name: 'Close',
                            type: 'button',
                            style: 'success',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathAlertClose}`,
                                context: {
                                    action: Actions.CLOSE_ALERT_BUTTON_EVENT,
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
                            id: Actions.OTHER_OPTIONS_SELECT_EVENT,
                            name: 'Other actions...',
                            integration: {
                                url: `${config.APP.HOST}${Routes.App.CallPathAlertOtherActions}`,
                                context: {
                                    action: Actions.OTHER_OPTIONS_SELECT_EVENT,
                                    alert: {
                                        id: alert.id,
                                        message: alert.message,
                                        tinyId: alert.tinyId
                                    },
                                    bot_access_token: call.context.bot_access_token,
                                    mattermost_site_url: mattermostUrl
                                } as CloseAlertAction
                            },
                            type: 'select',
                            options: optionsFollowup
                        }
                    ]
                }
            ]
        }
    };
    await mattermostClient.createPost(postCreate);
}
