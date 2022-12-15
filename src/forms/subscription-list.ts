import queryString, { ParsedQuery, ParsedUrl } from 'query-string';

import {
    AppCallRequest,
    Channel,
    Integration,
    IntegrationType,
    Integrations,
    ListIntegrationsParams,
    ResponseResultWithData,
    Subscription,
} from '../types';
import { ConfigStoreProps, KVStoreClient, KVStoreOptions } from '../clients/kvstore';
import { ExceptionType, StoreKeys } from '../constant';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { configureI18n } from '../utils/translations';
import { tryPromise } from '../utils/utils';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';
import { h6, joinLines } from '../utils/markdown';

export async function subscriptionListCall(call: AppCallRequest): Promise<string> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const i18nObj = configureI18n(call.context);

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

    const integrationParams: ListIntegrationsParams = {
        type: IntegrationType.WEBHOOK,
    };
    const integrationsResult: ResponseResultWithData<Integrations[]> = await tryPromise(opsGenieClient.listIntegrations(integrationParams), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    const promises: Promise<Subscription | undefined>[] = integrationsResult.data.map(async (int: Integrations) => {
        const responseIntegration: ResponseResultWithData<Integration> = await tryPromise(opsGenieClient.getIntegration(int.id), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
        const integration: Integration = responseIntegration.data;

        const queryParams: ParsedUrl = queryString.parseUrl(integration.url);
        const params: ParsedQuery = queryParams.query;
        try {
            const channel: Channel = await mattermostClient.getChannel(<string>params.channelId);
            return new Promise((resolve, reject) => {
                resolve({
                    integrationId: int.id,
                    ...responseIntegration.data,
                    channelId: channel.id,
                    channelName: channel.name,
                } as Subscription);
            });
        } catch (error) {
            return Promise.resolve(undefined);
        }

        
    });

    const integrations: Subscription[] = webhookSubscriptionArray(await Promise.all(promises));

    const subscriptionsText: string = [
        h6(i18nObj.__('api.subcription.message-list', { integrations: integrations.length.toString() })),
        `${joinLines(
            integrations.map((integration: Subscription) =>
                i18nObj.__('api.subcription.detail-list', { integration: integration.integrationId, name: integration.ownerTeam.name, channelName: integration.channelName })
            ).join('\n')
        )}`,
    ].join('');

    return subscriptionsText;
}

function webhookSubscriptionArray(array: (Subscription | undefined)[]): Subscription[] {
    return array.filter((el): el is Subscription => typeof (el) !== 'undefined');
}