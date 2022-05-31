import {
    AppCallRequest,
    AppCallValues,
    Identifier,
    IdentifierType
} from '../types';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {CloseAlertForm, StoreKeys} from '../constant';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {tryPromiseOpsgenieWithMessage} from '../utils/utils';

export async function closeAlertCall(call: AppCallRequest): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
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
    await tryPromiseOpsgenieWithMessage(opsGenieClient.getAlert(identifier), 'OpsGenie failed');

    await tryPromiseOpsgenieWithMessage(opsGenieClient.closeAlert(identifier), 'OpsGenie failed');
}
