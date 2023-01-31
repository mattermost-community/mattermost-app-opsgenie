import {
    AppActingUser,
    AppCallRequest,
    AppCallValues,
    AppForm,
    IntegrationType,
    ListIntegrationsParams,
    Oauth2App,
} from '../types';
import { AppFieldTypes, ConfigureForm, ExceptionType, OpsGenieIcon, Routes, StoreKeys } from '../constant';
import { KVStoreClient, KVStoreOptions } from '../clients/kvstore';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { Exception } from '../utils/exception';
import { configureI18n } from '../utils/translations';
import { isUserSystemAdmin, tryPromise } from '../utils/utils';
import { ExtendRequired } from '../utils/user-mapping';

export async function opsGenieConfigForm(call: AppCallRequest): Promise<AppForm> {
    const oauth2: Oauth2App = call.context.oauth2 as Oauth2App;
    const i18nObj = configureI18n(call.context);
    const actingUser: AppActingUser = call.context.acting_user!;
    const apiKeyOpsGenie: string | undefined = oauth2.client_id;

    if (!isUserSystemAdmin(actingUser)) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.configure-admin.system-admin'), call.context.mattermost_site_url, call.context.app_path);
    }

    const form: AppForm = {
        title: i18nObj.__('forms.configure-admin.title'),
        header: i18nObj.__('forms.configure-admin.header'),
        icon: OpsGenieIcon,
        fields: [
            {
                type: AppFieldTypes.TEXT,
                name: ConfigureForm.API_KEY,
                modal_label: i18nObj.__('forms.configure-admin.label'),
                value: apiKeyOpsGenie,
                description: i18nObj.__('forms.configure-admin.description'),
                is_required: true,
            },
        ],
        submit: {
            path: Routes.App.CallPathConfigSubmit,
            expand: {
                ...ExtendRequired,
            },
        },
    };
    return form;
}

export async function opsGenieConfigSubmit(call: AppCallRequest): Promise<string> {
    const mattermostUrl: string = call.context.mattermost_site_url!;
    const accessToken: string = call.context.acting_user_access_token!;
    const oauth2: Oauth2App = call.context.oauth2 as Oauth2App;
    const values: AppCallValues = <any>call.values;
    const i18nObj = configureI18n(call.context);
    const linkEmailAddress: boolean = typeof oauth2.data?.settings?.link_email_address === 'boolean' ?
        oauth2.data?.settings.link_email_address :
        true;

    const opsGenieApiKey: string = values[ConfigureForm.API_KEY];

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: opsGenieApiKey,
    };
    const opsgenieClient: OpsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const params: ListIntegrationsParams = {
        type: IntegrationType.API,
    };
    await tryPromise(opsgenieClient.listIntegrations(params), ExceptionType.TEXT_ERROR, i18nObj.__('forms.configure-admin.exception'), call.context.mattermost_site_url, call.context.app_path);

    const options: KVStoreOptions = {
        mattermostUrl,
        accessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const oauthApp: Oauth2App = {
        client_id: opsGenieApiKey,
        client_secret: '',
        data: {
            settings: {
                link_email_address: linkEmailAddress,
            },
        },
    };
    await kvStoreClient.storeOauth2App(oauthApp);

    return i18nObj.__('api.configure.success-response');
}

