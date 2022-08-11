import {
    Identifier,
    User,
    IdentifierType,
    AlertAssign,
    AppCallRequest,
    AppCallValues, 
    AppCallAction, 
    AppContextAction, 
    ResponseResultWithData, 
    Alert
} from '../types';
import {MattermostClient, MattermostOptions} from '../clients/mattermost';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {AssignAlertForm, ExceptionType, StoreKeys} from '../constant';
import {tryPromise} from '../utils/utils';

export async function assignAlertCall(call: AppCallRequest): Promise<string> {
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
    const userResponse = await tryPromise(opsGenieClient.getUser(identifierUser),  ExceptionType.MARKDOWN, 'OpsGenie failed');

    const identifierAlert: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY
    }
    const responseAlert: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifierAlert), ExceptionType.MARKDOWN, 'OpsGenie failed');
    const alert = responseAlert.data;

    const data: AlertAssign = {
        user: username,
        owner: {
            username: mattermostUser.email
        },
        note: "Action executed via Mattermost Plugin"
    };
    await tryPromise(opsGenieClient.assignAlert(identifierAlert, data), ExceptionType.MARKDOWN, 'OpsGenie failed');
    return `Assign alert's #${alert.tinyId} ownership to ${mattermostUser.email} will be processed`;
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
    await tryPromise(opsGenieClient.getUser(identifierUser), ExceptionType.MARKDOWN, 'OpsGenie failed');

    const identifierAlert: Identifier = {
        identifier: alert.tinyId,
        identifierType: IdentifierType.TINY
    }
    const responseAlert: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifierAlert), ExceptionType.MARKDOWN, 'OpsGenie failed');

    const data: AlertAssign = {
        user: username,
        owner: {
            username: mattermostUser.email
        }
    };
    await tryPromise(opsGenieClient.assignAlert(identifierAlert, data), ExceptionType.MARKDOWN, 'OpsGenie failed');

    await mattermostClient.deletePost(postId);

    return responseAlert.data;
}
