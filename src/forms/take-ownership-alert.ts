import {
    Alert,
    AlertAssign,
    AppCallRequest,
    AppCallValues,
    Identifier,
    IdentifierType,
    ResponseResultWithData,
    User
} from '../types';
import {StoreKeys, TakeOwnershipAlertForm} from '../constant';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {tryPromiseOpsgenieWithMessage} from '../utils/utils';
import {MattermostClient, MattermostOptions} from '../clients/mattermost';

export async function takeOwnershipAlertCall(call: AppCallRequest): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const username: string | undefined = call.context.acting_user?.username;
    const userId: string | undefined = call.context.acting_user?.id;
    const values: AppCallValues | undefined = call.values;

    const alertTinyId: string = values?.[TakeOwnershipAlertForm.NOTE_TINY_ID];

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const config: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: config.opsgenie_apikey
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: botAccessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    const mattermostUser: User = await mattermostClient.getUser(<string>userId);

    const identifierUser: Identifier = {
        identifier: mattermostUser.email,
        identifierType: IdentifierType.USERNAME
    }
    await tryPromiseOpsgenieWithMessage(opsGenieClient.getUser(identifierUser), 'OpsGenie failed');

    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY
    };
    const responseAlert: ResponseResultWithData<Alert> = await tryPromiseOpsgenieWithMessage(opsGenieClient.getAlert(identifier), 'OpsGenie failed');
    const alert: Alert = responseAlert.data;

    if (!alert.owner || alert.owner === mattermostUser.email) {
        throw new Error(`Take ownership request will be processed for #165`);
    }

    const data: AlertAssign = {
        user: username,
        owner: {
            username: mattermostUser.email
        }
    };
    await tryPromiseOpsgenieWithMessage(opsGenieClient.assignAlert(identifier, data), 'OpsGenie failed');
}
