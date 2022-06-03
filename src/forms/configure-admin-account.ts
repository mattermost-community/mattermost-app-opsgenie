import {
    AppCallRequest,
    AppCallValues,
    AppForm,
    Integrations,
    IntegrationType,
    ListIntegrationsParams,
    ResponseResultWithData
} from '../types';
import {
    AppFieldTypes,
    ConfigureForm,
    OpsGenieIcon,
    Routes,
    StoreKeys
} from '../constant';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';

export async function opsGenieConfigForm(call: AppCallRequest): Promise<AppForm> {
    console.log('call', call);
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const config: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const form: AppForm = {
        title: 'Configure OpsGenie',
        header: 'Configure the OpsGenie app with the following information.',
        icon: OpsGenieIcon,
        fields: [
            {
                type: AppFieldTypes.TEXT,
                name: ConfigureForm.API_KEY,
                modal_label: 'API Key',
                value: config.opsgenie_apikey,
                description: 'API integration OpsGenie api key',
                is_required: true,
            }
        ],
        submit: {
            path: Routes.App.CallPathConfigSubmit,
            expand: {}
        },
    };
    return form;
}

export async function opsGenieConfigSubmit(call: AppCallRequest): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const values: AppCallValues = <any>call.values;

    const opsGenieApiKey: string = values[ConfigureForm.API_KEY];

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: opsGenieApiKey
    };
    const opsgenieClient: OpsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const params: ListIntegrationsParams = {
        type: IntegrationType.API
    }
    const integrations: ResponseResultWithData<Integrations[]> = await opsgenieClient.listIntegrations(params);
    if (!integrations.data.length) {
        throw new Error('Your opsgenie setup has no api integration');
    }

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const config: ConfigStoreProps = {
        opsgenie_apikey: opsGenieApiKey,
    };
    await kvStoreClient.kvSet(StoreKeys.config, config);
}

