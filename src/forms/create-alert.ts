import {
    AlertCreate,
    AppCallRequest
} from '../types';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {option_alert_priority_p3, StoreKeys} from '../constant';

export async function newCreateAlertCall(call: AppCallRequest): Promise<void> {
    console.log('call', call);
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const message: string = call.values?.message;
    const priority: string = call.values?.priority?.value || option_alert_priority_p3;

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

    const alertCreate: AlertCreate = {
        message,
        priority
    };
    await opsGenieClient.createAlert(alertCreate);
}
