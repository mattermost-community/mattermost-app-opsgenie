import {
    Identifier,
    AppCallAction,
    CloseAlertAction,
    User,
    IdentifierType,
    ResponseResultWithData,
    OpsUser, AlertAssign
} from '../types';
import {MattermostClient, MattermostOptions} from '../clients/mattermost';
import {OpsGenieClient} from "../clients/opsgenie";

export async function assignOwnerAlertCall(call: AppCallAction<CloseAlertAction>): Promise<void> {
    const mattermostUrl: string|undefined = call.context.mattermost_site_url;
    const accessToken: string|undefined = call.context.bot_access_token;
    const userId: string|undefined = call.context.selected_option;
    const alertTinyId: string = call.context.alert.tinyId;

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>accessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    const opsGenieClient = new OpsGenieClient();

    const mattermostUser: User = await mattermostClient.getUser(<string>userId);
    const identifierUser: Identifier = {
        identifier: mattermostUser.email,
        identifierType: IdentifierType.USERNAME
    }
    const opsgenieUser: ResponseResultWithData<OpsUser> = await opsGenieClient.getUser(identifierUser);

    const identifierAlert: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY
    }
    const data: AlertAssign = {
        owner: {
            id: opsgenieUser.data.id
        }
    };
    await opsGenieClient.assignAlert(identifierAlert, data);
}
