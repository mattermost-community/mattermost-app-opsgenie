import {
    AppCallRequest,
    Subscription,
} from '../types';
import { configureI18n } from '../utils/translations';
import { getIntegrationsList } from '../utils/utils';
import { h6, joinLines } from '../utils/markdown';

export async function subscriptionListCall(call: AppCallRequest): Promise<string> {
    const i18nObj = configureI18n(call.context);
    const integrations: Subscription[] = await getIntegrationsList(call);

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
