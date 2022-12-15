import { AppCallRequest, AppCallValues, AppForm, AppFormValue, AppSelectOption, Subscription } from '../types';
import { ConfigStoreProps, KVStoreClient, KVStoreOptions } from '../clients/kvstore';
import { AppExpandLevels, AppFieldTypes, ExceptionType, OpsGenieIcon, Routes, StoreKeys, SubscriptionCreateForm, SubscriptionDeleteForm } from '../constant';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { configureI18n } from '../utils/translations';
import { getIntegrationsList, tryPromise } from '../utils/utils';
import { Exception } from '../utils/exception';

export async function subscriptionDeleteCall(call: AppCallRequest): Promise<string> {
    const mattermostUrl: string = call.context.mattermost_site_url!;
    const botAccessToken: string = call.context.bot_access_token!;
    const values: AppCallValues | undefined = call.values;
    const i18nObj = configureI18n(call.context);

    const subscription: AppSelectOption = values?.[SubscriptionDeleteForm.SUBSCRIPTION_ID];

    const options: KVStoreOptions = {
        mattermostUrl,
        accessToken: botAccessToken,
    };
    const kvStore: KVStoreClient = new KVStoreClient(options);

    const configStore: ConfigStoreProps = await kvStore.kvGet(StoreKeys.config);

    const optionsOps: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey,
    };
    const opsGenieClient: OpsGenieClient = new OpsGenieClient(optionsOps);

    await tryPromise(opsGenieClient.deleteIntegration(subscription.value), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
    return i18nObj.__('api.subcription.message-delete');
}

export async function subscriptionDeleteFormCall(call: AppCallRequest): Promise<AppForm> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const i18nObj = configureI18n(call.context);

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };

    const integrations: Subscription[] = await getIntegrationsList(options, i18nObj);

    if (!integrations.length) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('binding.binding.command-delete-no-subscriptions'));
    }
    
    const subscriptionOptions: AppSelectOption[] = integrations.map(integration => {
        return {
            label: i18nObj.__('binding.binding.command-delete-value', { integration: integration.integrationId, name: integration.ownerTeam.name, channelName: integration.channelName }),
            value: integration.integrationId
        } as AppSelectOption
    })

    const form: AppForm = {
        title: i18nObj.__('binding.binding.command-delete-title'),
        icon: OpsGenieIcon,
        submit: {
            path: Routes.App.CallPathSubscriptionDeleteSubmit,
            expand: {
                app: AppExpandLevels.EXPAND_ALL,
                oauth2_app: AppExpandLevels.EXPAND_ALL,
                oauth2_user: AppExpandLevels.EXPAND_ALL,
            },
        },
        fields: [
            {
                modal_label: i18nObj.__('binding.binding.label-delete'),
                name: SubscriptionDeleteForm.SUBSCRIPTION_ID,
                type: AppFieldTypes.STATIC_SELECT,
                is_required: true,
                position: 1,
                options: subscriptionOptions
            },
        ],
    };

    return form;
}