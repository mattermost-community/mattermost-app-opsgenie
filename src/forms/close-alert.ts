import {
    Alert,
    AlertClose,
    AlertStatus,
    AppCallRequest,
    AppCallValues,
    Identifier,
    IdentifierType,
    ResponseResultWithData
} from '../types';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {CloseAlertForm, ExceptionType, StoreKeys} from '../constant';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {tryPromise} from '../utils/utils';
import {Exception} from "../utils/exception";

export async function closeAlertCall(call: AppCallRequest): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const username: string | undefined = call.context.acting_user?.username;
    const values: AppCallValues | undefined = call.values;

    const alertTinyId: string = values?.[CloseAlertForm.NOTE_TINY_ID];

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
    const response: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN,  'OpsGenie failed');
    const alert: Alert = response.data;

    if (alert.status === AlertStatus.CLOSED) {
        throw new Exception(ExceptionType.MARKDOWN, `You have closed #${alert.tinyId}`, );
    }

    const data: AlertClose = {
        user: username
    };
    await tryPromise(opsGenieClient.closeAlert(identifier, data), ExceptionType.MARKDOWN,  'OpsGenie failed');
}
