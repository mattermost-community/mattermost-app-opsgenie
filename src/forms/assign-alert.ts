import {
    Identifier,
    User,
    IdentifierType,
    AlertAssign,
    AppCallRequest,
    AppCallValues, AppCallAction, AppContextAction, ResponseResult, ResponseResultWithData, Alert
} from '../types';
import {MattermostClient, MattermostOptions} from '../clients/mattermost';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {AssignAlertForm, StoreKeys} from '../constant';
import {tryPromiseOpsgenieWithMessage} from '../utils/utils';

export async function assignAlertCall(call: AppCallRequest): Promise<Alert> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const username: string | undefined = call.context.acting_user?.username;
    const values: AppCallValues | undefined = call.values;

    const userId: string = values?.[AssignAlertForm.USER_ID].value;
    const alertTinyId: string = values?.[AssignAlertForm.NOTE_TINY_ID];

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
    const mattermostUser: User = await mattermostClient.getUser(userId);

    const identifierUser: Identifier = {
        identifier: mattermostUser.email,
        identifierType: IdentifierType.USERNAME
    }
    await tryPromiseOpsgenieWithMessage(opsGenieClient.getUser(identifierUser), 'OpsGenie failed');

    const identifierAlert: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY
    }
    const responseAlert: ResponseResultWithData<Alert> = await tryPromiseOpsgenieWithMessage(opsGenieClient.getAlert(identifierAlert), 'OpsGenie failed');

    const data: AlertAssign = {
        user: username,
        owner: {
            username: mattermostUser.email
        }
    };
    await tryPromiseOpsgenieWithMessage(opsGenieClient.assignAlert(identifierAlert, data), 'OpsGenie failed');

    return responseAlert.data;
}

export async function assignAlertAction(call: AppCallAction<AppContextAction>): Promise<Alert> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const username: string | undefined = call.user_name;
    const postId: string | undefined = call.post_id;
    const userId: string | undefined = call.context.selected_option;
    const alert: any = call.context.alert;

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

    const identifierAlert: Identifier = {
        identifier: alert.tinyId,
        identifierType: IdentifierType.TINY
    }
    const responseAlert: ResponseResultWithData<Alert> = await tryPromiseOpsgenieWithMessage(opsGenieClient.getAlert(identifierAlert), 'OpsGenie failed');

    const data: AlertAssign = {
        user: username,
        owner: {
            username: mattermostUser.email
        }
    };
    await tryPromiseOpsgenieWithMessage(opsGenieClient.assignAlert(identifierAlert, data), 'OpsGenie failed');

    await mattermostClient.deletePost(postId);

    return responseAlert.data;
}
