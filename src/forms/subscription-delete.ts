import { AppCallRequest, AppCallValues, AppForm, AppFormValue, AppSelectOption } from '../types';
import { ConfigStoreProps, KVStoreClient, KVStoreOptions } from '../clients/kvstore';
import { AppExpandLevels, AppFieldTypes, ExceptionType, OpsGenieIcon, Routes, StoreKeys, SubscriptionCreateForm, SubscriptionDeleteForm } from '../constant';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { configureI18n } from '../utils/translations';
import { tryPromise } from '../utils/utils';
import { getAllTeamsCall } from './list-team';

export async function subscriptionDeleteCall(call: AppCallRequest): Promise<string> {
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
    return i18nObj.__('api.subcription.message-delete');
}

export async function subscriptionDeleteFormCall(call: AppCallRequest): Promise<AppForm> {
    const i18nObj = configureI18n(call.context);
    const currChannel = call.context.channel;
    const channelOption: AppFormValue = {
        label: <string>currChannel?.name,
        value: <string>currChannel?.id
    }

    const teams = await getAllTeamsCall(call)
    const teamOptions: AppSelectOption[] = teams.map(team => {
        return {
            label: team.name,
            value: team.id
        } as AppSelectOption
    });

    const form: AppForm = {
        title: i18nObj.__('binding.binding.label-delete'),
        icon: OpsGenieIcon,
        submit: {
            path: Routes.App.CallPathSubscriptionAddSubmit,
            expand: {
                app: AppExpandLevels.EXPAND_ALL,
                oauth2_app: AppExpandLevels.EXPAND_ALL,
                oauth2_user: AppExpandLevels.EXPAND_ALL,
            },
        },
        fields: [
            {
                modal_label: i18nObj.__('binding.binding.name-team'),
                name: SubscriptionCreateForm.TEAM_NAME,
                type: AppFieldTypes.STATIC_SELECT,
                is_required: true,
                position: 1,
                options: teamOptions
            },
            {
                modal_label: i18nObj.__('binding.binding.name-channel'),
                name: SubscriptionCreateForm.CHANNEL_ID,
                type: AppFieldTypes.CHANNEL,
                is_required: true,
                position: 2,
                value: channelOption
            },
        ],
    };

    return form;
}