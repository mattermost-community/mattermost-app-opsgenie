import {
    AppCallRequest,
    AppCallValues,
    AppForm,
    Integrations,
    IntegrationType,
    ListIntegrationsParams,
    ResponseResultWithData
} from '../types';
import {AppFieldTypes, ConfigureForm, ExceptionType, OpsGenieIcon, Routes, StoreKeys} from '../constant';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {Exception} from "../utils/exception";
import {configureI18n} from "../utils/translations";

export async function opsGenieConfigForm(call: AppCallRequest): Promise<AppForm> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
		const i18nObj = configureI18n(call.context);

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const config: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const form: AppForm = {
        title: i18nObj.__('forms.configure-admin.title'),
        header: i18nObj.__('forms.configure-admin.header'),
        icon: OpsGenieIcon,
        fields: [
            {
                type: AppFieldTypes.TEXT,
                name: ConfigureForm.API_KEY,
                modal_label: i18nObj.__('forms.configure-admin.label'),
                value: config.opsgenie_apikey,
                description: i18nObj.__('forms.configure-admin.description'),
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
		const i18nObj = configureI18n(call.context);

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
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.configure-admin.exception'));
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

