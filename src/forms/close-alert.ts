import {
    Alert,
    AppCallAction,
    CloseAlertAction,
    Identifier,
    IdentifierType,
    PostCreate,
    PostUpdate,
    ResponseResultWithData,
    Team
} from '../types';
import {OpsGenieClient} from '../clients/opsgenie';
import {MattermostClient, MattermostOptions} from '../clients/mattermost';
import {hyperlink} from '../utils/markdown';

export async function closeAlertCall(call: AppCallAction<CloseAlertAction>): Promise<void> {
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

    await opsGenieClient.closeAlert(identifier);

    const mattermostOptions: MattermostOptions = {
        mattermostUrl,
        accessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    const postCreate: PostCreate = {
        channel_id: channelId,
        message: '',
        props: {
            attachments: [
                {
                    text: `${alert.source} closed alert ${hyperlink(`#${alert.tinyId}`, `https://testancient.app.opsgenie.com/alert/detail/${alert.id}`)}: "${alert.message}"`
                }
            ]
        }
    };
    await mattermostClient.createPost(postCreate);

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
                    ]
                }
            ]
        }
    };
    await mattermostClient.updatePost(postId, postUpdate);
}
