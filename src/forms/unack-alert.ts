import {
    Alert,
    AlertUnack,
    AppCallAction,
    AppCallRequest,
    AppCallValues,
    AppContextAction,
    Identifier,
    IdentifierType,
    PostEphemeralCreate,
    ResponseResultWithData,
} from '../types';
import {AckAlertForm, ExceptionType, StoreKeys} from '../constant';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {tryPromise} from '../utils/utils';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';
import { bodyPostUpdate } from './ack-alert';

export async function unackAlertCall(call: AppCallRequest): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const username: string | undefined = call.context.acting_user?.username;
    const values: AppCallValues | undefined = call.values;

    const alertTinyId: string = values?.[AckAlertForm.NOTE_TINY_ID];

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

    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY
    };
    const response: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, 'OpsGenie failed');
    const alert: Alert = response.data;
    if (!alert.acknowledged) {
        throw new Error(`Unacknowledge request will be processed for #${alert.tinyId}`);
    }

    const data: AlertUnack = {
        user: username
    };
    await tryPromise(opsGenieClient.unacknowledgeAlert(identifier, data), ExceptionType.MARKDOWN, 'OpsGenie failed');
}

export async function unackAlertAction(call: AppCallAction<AppContextAction>): Promise<void> {
    let message: string;
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const username: string | undefined = call.user_name;
    const values: AppCallValues | undefined = call.context.alert;
    const channelId: string | undefined = call.channel_id;
    const alertTinyId: string = values?.[AckAlertForm.TINY_ID];
    const postId: string = call.post_id;
    let acknowledged: boolean = true;

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    try {
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

        const identifier: Identifier = {
            identifier: alertTinyId,
            identifierType: IdentifierType.TINY
        };
        const response: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, 'OpsGenie failed');
        const alert: Alert = response.data;
        if (!alert.acknowledged) {
            throw new Error(`You haven't acknowledge alert #${alert.tinyId}`);
        }

        const data: AlertUnack = {
            user: username
        };
        await tryPromise(opsGenieClient.unacknowledgeAlert(identifier, data), ExceptionType.MARKDOWN, 'OpsGenie failed');
        message = `You have unacknowledged #${alert.tinyId}`;
    } catch (error: any) {
        acknowledged = false;
        message = 'Unexpected error: ' + error.message;
    }

    const post: PostEphemeralCreate = {
        post: {
            message: message,
            channel_id: channelId,
        },
        user_id: call.user_id,
    };

    await mattermostClient.updatePost(postId, await bodyPostUpdate(call, acknowledged));
    await mattermostClient.createEphemeralPost(post);
   }