import {
    Alert,
    AlertAck,
    AppCallRequest,
    AppCallValues,
    Identifier,
    IdentifierType,
    ResponseResultWithData,
} from '../types';
import {AckAlertForm, ExceptionType, StoreKeys} from '../constant';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {tryPromise} from '../utils/utils';
import {Exception} from "../utils/exception";

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
