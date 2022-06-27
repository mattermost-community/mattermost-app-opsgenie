import {
    Alert, AlertAck,
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
import {Exception} from "../utils/exception";
import { MattermostClient } from '../clients/mattermost';

export async function ackAlertCall(call: AppCallRequest): Promise<void> {
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
    if (alert.acknowledged) {
        throw new Exception(ExceptionType.MARKDOWN, `You have acknowledged #${alert.tinyId}`);
    }

    const data: AlertAck = {
        user: username
    };
    await tryPromise(opsGenieClient.acknowledgeAlert(identifier, data), ExceptionType.MARKDOWN, 'OpsGenie failed');
}

export async function ackAlertAction(call: AppCallAction<AppContextAction>): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    let message: string;
    const username: string | undefined = call.user_name;
    const values: AppCallValues | undefined = call.context.alert;
    const channelId: string | undefined = call.channel_id;
    const alertTinyId: string = values?.[AckAlertForm.TINY_ID];
    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(options);

    try {
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
        if (alert.acknowledged) {
            throw new Error(`You already have acknowledged #${alert.tinyId}`);
        }

        const data: AlertAck = {
            user: username
        };
        const res = await tryPromise(opsGenieClient.acknowledgeAlert(identifier, data), ExceptionType.MARKDOWN, 'OpsGenie failed');
        message = `You have acknowledged #${alert.tinyId}`;
    } catch (error: any) {
        message = 'Unexpected error: ' + error.message;
    }
    const post: PostEphemeralCreate = {
        post: {
            message: message,
            channel_id: channelId,
        },

        user_id: call.user_id,

    };

    await mattermostClient.createEphemeralPost(post);

}
