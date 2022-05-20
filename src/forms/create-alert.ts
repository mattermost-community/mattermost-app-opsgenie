import axios from 'axios';
import {
    Alert,
    AlertCreate,
    AppCallRequest,
    ListAlertParams,
    PostCreate,
    ResponseResultWithData,
    Team,
    Identifier
} from '../types';
import {OpsGenieClient, OpsGenieClientOptions} from '../clients/opsgenie';
import {Routes} from '../constant';
import config from '../config';

export async function newCreateAlertForm(call: AppCallRequest): Promise<void> {
    const opsgenieOptions: OpsGenieClientOptions = {
        oauth2UserAccessToken: ''
    };
    console.log('context', call.context);

    const opsGenieClient = new OpsGenieClient(opsgenieOptions);

    const message: string = call.values?.message;
    const payload: AlertCreate = {
        message
    };

    /*opsgenieClient.alertV2.create(payload,  function (error: any, result: ResponseResult) {
        if (error) {
            return rejects(error);
        }
    });*/

    const alertParams: ListAlertParams = {
        limit: 1,
        offset: 0,
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

    const mattermostUrl: string = `${call.context.mattermost_site_url}${Routes.Mattermost.ApiVersionV4}${Routes.Mattermost.PostsPath}`;
    const channelId: string = call.context.channel.id;

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
                                url: `${config.APP.HOST}:${config.APP.PORT}${Routes.App.BindingPathHelp}`,
                                context: {
                                    action: "do_something",
                                    token: '',
                                    cardName: '',
                                    channel: ''
                                }
                            }
                        },
                        {
                            id: 'close_alert',
                            name: 'Close',
                            type: 'button',
                            style: 'success',
                            integration: {
                                url: `${config.APP.HOST}:${config.APP.PORT}${Routes.App.BindingPathHelp}`,
                                context: {
                                    action: "do_something",
                                    token: '',
                                    cardName: '',
                                    channel: ''
                                }
                            }
                        },
                        {
                            id: "action_options",
                            name: "Other actions...",
                            integration: {
                                url: `${config.APP.HOST}:${config.APP.PORT}${Routes.App.BindingPathHelp}`,
                                context: {
                                    action: "do_something",
                                    token: '',
                                    cardName: '',
                                    channel: ''
                                }
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

    await axios.post(mattermostUrl, postCreate, {
        headers: {
            Authorization: `Bearer ${call.context.bot_access_token}`
        }
    });
}
