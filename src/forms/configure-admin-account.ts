import {
    AppCallRequest,
    AppCallValues,
    AppForm,
    IntegrationType,
    ListIntegrationsParams,
    AppActingUser,
} from '../types';
import { AppExpandLevels, AppFieldTypes, ConfigureForm, ExceptionType, OpsGenieIcon, Routes, StoreKeys } from '../constant';
import { ConfigStoreProps, KVStoreClient, KVStoreOptions } from '../clients/kvstore';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { Exception } from '../utils/exception';
import { configureI18n } from '../utils/translations';
import { isUserSystemAdmin, tryPromise } from '../utils/utils';

export async function opsGenieConfigForm(call: AppCallRequest): Promise<AppForm> {
    const mattermostUrl: string = call.context.mattermost_site_url!;
    const botAccessToken: string = call.context.bot_access_token!;
    const i18nObj = configureI18n(call.context);
    const actingUser: AppActingUser = call.context.acting_user!;

    if (!isUserSystemAdmin(actingUser)) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.configure-admin.system-admin'));
    }

    const options: KVStoreOptions = {
        mattermostUrl: mattermostUrl,
        accessToken: botAccessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const kvConfig: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const form: AppForm = {
        title: i18nObj.__('forms.configure-admin.title'),
        header: i18nObj.__('forms.configure-admin.header'),
        icon: OpsGenieIcon,
        fields: [
            {
                type: AppFieldTypes.TEXT,
                name: ConfigureForm.API_KEY,
                modal_label: i18nObj.__('forms.configure-admin.label'),
                value: kvConfig.opsgenie_apikey,
                description: i18nObj.__('forms.configure-admin.description'),
                is_required: true,
            },
        ],
        submit: {
            path: Routes.App.CallPathConfigSubmit,
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                acting_user_access_token: AppExpandLevels.EXPAND_SUMMARY,
            },
        },
    };
    return form;
}

export async function opsGenieConfigSubmit(call: AppCallRequest): Promise<string> {
    const mattermostUrl: string = call.context.mattermost_site_url!;
    const botAccessToken: string = call.context.bot_access_token!;
    const values: AppCallValues = <any>call.values;
    const i18nObj = configureI18n(call.context);
    const actingUser: AppActingUser = call.context.acting_user!;

    if (!isUserSystemAdmin(actingUser)) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.configure-admin.system-admin'));
    }

    const opsGenieApiKey: string = values[ConfigureForm.API_KEY];

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: opsGenieApiKey,
    };
    const opsgenieClient: OpsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const params: ListIntegrationsParams = {
        type: IntegrationType.API,
    };
    await tryPromise(opsgenieClient.listIntegrations(params), ExceptionType.TEXT_ERROR, i18nObj.__('forms.configure-admin.exception'));

    const options: KVStoreOptions = {
        mattermostUrl: mattermostUrl,
        accessToken: botAccessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const kvConfig: ConfigStoreProps = {
        opsgenie_apikey: opsGenieApiKey,
    };
    await kvStoreClient.kvSet(StoreKeys.config, kvConfig);
    return i18nObj.__('api.configure.success-response');
}

