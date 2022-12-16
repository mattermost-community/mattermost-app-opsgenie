import {
    AppCallRequest,
    Subscription,
} from '../types';
import { KVStoreOptions } from '../clients/kvstore';
import { configureI18n } from '../utils/translations';
import { getIntegrationsList } from '../utils/utils';
import { h6, joinLines } from '../utils/markdown';

export async function subscriptionListCall(call: AppCallRequest): Promise<string> {
    const mattermostUrl: string = call.context.mattermost_site_url!;
    const botAccessToken: string = call.context.bot_access_token!;
    const i18nObj = configureI18n(call.context);

    const options: KVStoreOptions = {
        mattermostUrl,
        accessToken: botAccessToken,
    };

    const integrations: Subscription[] = await getIntegrationsList(options, i18nObj);

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
