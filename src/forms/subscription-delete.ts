import { AppCallRequest, AppCallValues } from '../types';
import { ConfigStoreProps, KVStoreClient, KVStoreOptions } from '../clients/kvstore';
import { ExceptionType, StoreKeys, SubscriptionDeleteForm } from '../constant';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { configureI18n } from '../utils/translations';
import { tryPromise } from '../utils/utils';

export async function subscriptionDeleteCall(call: AppCallRequest): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const values: AppCallValues | undefined = call.values;
    const i18nObj = configureI18n(call.context);

    const subscriptionId: string = values?.[SubscriptionDeleteForm.SUBSCRIPTION_ID];

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStore: KVStoreClient = new KVStoreClient(options);

    const configStore: ConfigStoreProps = await kvStore.kvGet(StoreKeys.config);

    const optionsOps: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey,
    };
    const opsGenieClient: OpsGenieClient = new OpsGenieClient(optionsOps);

    await tryPromise(opsGenieClient.deleteIntegration(subscriptionId), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
}
