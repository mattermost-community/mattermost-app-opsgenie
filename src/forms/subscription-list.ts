import {
    AppCallRequest,
    Integration,
    IntegrationType,
    ListIntegrationsParams,
    ResponseResultWithData,
} from '../types';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {StoreKeys} from '../constant';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {tryPromiseOpsgenieWithMessage} from '../utils/utils';

export async function subscriptionListCall(call: AppCallRequest): Promise<Integration[]> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const kvStore: KVStoreClient = new KVStoreClient(options);

    const configStore: ConfigStoreProps = await kvStore.kvGet(StoreKeys.config);

    const optionsOps: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey
    };
    const opsGenieClient: OpsGenieClient = new OpsGenieClient(optionsOps);

    const params: ListIntegrationsParams = {
        type: IntegrationType.WEBHOOK,
    };
    const responseIntegration: ResponseResultWithData<Integration[]> = await tryPromiseOpsgenieWithMessage(opsGenieClient.listIntegrations(params), 'OpsGenie failed');

    return responseIntegration.data;
}
