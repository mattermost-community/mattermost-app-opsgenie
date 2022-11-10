import {
    AppCallRequest,
    Channel,
    Integration,
    Integrations,
    IntegrationType,
    ListIntegrationsParams,
    ResponseResultWithData,
    Subscription,
} from '../types';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {ExceptionType, StoreKeys} from '../constant';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {configureI18n} from "../utils/translations";
import {tryPromise} from '../utils/utils';
import queryString, {ParsedQuery, ParsedUrl} from "query-string";
import {MattermostClient, MattermostOptions} from '../clients/mattermost';

export async function subscriptionListCall(call: AppCallRequest): Promise<Subscription[]> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
		const i18nObj = configureI18n(call.context);

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
    const responseIntegration: ResponseResultWithData<Integrations[]> = await tryPromise(opsGenieClient.listIntegrations(params), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    const promises: Promise<Subscription>[] = responseIntegration.data.map((int: Integrations) => {
        return new Promise(async (resolve, reject) => {
            const responseIntegration: ResponseResultWithData<Integration> = await tryPromise(opsGenieClient.getIntegration(int.id), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
            const integration: Integration = responseIntegration.data;

            const queryParams: ParsedUrl = queryString.parseUrl(integration.url);
            const params: ParsedQuery = queryParams.query;
            const channel: Channel = await mattermostClient.getChannel(<string>params['channelId']);

            resolve({
                integrationId: int.id,
                ...responseIntegration.data,
                channelId: channel.id,
                channelName: channel.name
            } as Subscription);
        });
    });

    return await Promise.all(promises);
}
