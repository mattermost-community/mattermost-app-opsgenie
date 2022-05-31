import {
    Account,
    Alert,
    AppCallRequest,
    ListAlertParams,
    ResponseResultWithData,
} from '../types';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {StoreKeys} from '../constant';
import {tryPromiseOpsgenieWithMessage} from '../utils/utils';

export async function getAllAlertCall(call: AppCallRequest): Promise<[Alert[], Account]> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;

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

    const params: ListAlertParams = {
        limit: 100
    };
    const teams: ResponseResultWithData<Alert[]> = await tryPromiseOpsgenieWithMessage(opsGenieClient.listAlert(params), 'OpsGenie failed');

    const account: ResponseResultWithData<Account> = await tryPromiseOpsgenieWithMessage(opsGenieClient.getAccount(), 'OpsGenie failed');

    return [teams.data, account.data];
}
