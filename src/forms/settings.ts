import {
    AppActingUser,
    AppCallRequest,
    AppCallValues,
    AppForm,
    Oauth2App,
} from '../types';
import { AppFieldTypes, ExceptionType, OpsGenieIcon, Routes, SettingsForm } from '../constant';
import { KVStoreClient, KVStoreOptions } from '../clients/kvstore';
import { configureI18n } from '../utils/translations';
import { ExtendRequired } from '../utils/user-mapping';
import { Exception } from '../utils/exception';
import { isUserSystemAdmin } from '../utils/utils';
import { AppFormValidator } from '../utils/validator';

export async function settingsForm(call: AppCallRequest): Promise<AppForm> {
    const oauth2: Oauth2App = call.context.oauth2 as Oauth2App;
    const actingUser: AppActingUser = call.context.acting_user!;
    const i18nObj = configureI18n(call.context);

    if (!isUserSystemAdmin(actingUser)) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.configure-admin.system-admin'), call.context.mattermost_site_url, call.context.app_path);
    }

    const linkEmailAddress: boolean = typeof oauth2.data?.settings?.link_email_address === 'boolean' ?
        oauth2.data?.settings.link_email_address :
        true;

    const form: AppForm = {
        title: i18nObj.__('forms.settings.title'),
        icon: OpsGenieIcon,
        fields: [
            {
                type: AppFieldTypes.BOOL,
                name: SettingsForm.ALLOW_USER_MAPPING,
                modal_label: i18nObj.__('forms.settings.allow-user-mapping-field-label'),
                value: linkEmailAddress,
                description: i18nObj.__('forms.settings.allow-user-mapping-field-description'),
                is_required: false,
            },
        ],
        submit: {
            path: Routes.App.CallPathSettingsSubmit,
            expand: {
                ...ExtendRequired,
            },
        },
    };
    if (!AppFormValidator.safeParse(form).success) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);
    }

    return form;
}

export async function settingsFormSubmit(call: AppCallRequest): Promise<string> {
    const mattermostUrl: string = call.context.mattermost_site_url!;
    const accessToken: string = call.context.acting_user_access_token!;
    const actingUser: AppActingUser = call.context.acting_user!;
    const oauth2: Oauth2App = call.context.oauth2 as Oauth2App;
    const values: AppCallValues | undefined = call.values;
    const i18nObj = configureI18n(call.context);

    if (!isUserSystemAdmin(actingUser)) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.configure-admin.system-admin'), call.context.mattermost_site_url, call.context.app_path);
    }

    if (!values) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('general.validation-form.values-not-found'), call.context.mattermost_site_url, call.context.app_path);
    }

    const linkEmailAddress: boolean = values[SettingsForm.ALLOW_USER_MAPPING];

    const options: KVStoreOptions = {
        mattermostUrl,
        accessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const oauthApp: Oauth2App = {
        client_id: oauth2.client_id,
        client_secret: oauth2.client_secret,
        data: {
            settings: {
                link_email_address: linkEmailAddress,
            },
        },
    };
    await kvStoreClient.storeOauth2App(oauthApp);

    return i18nObj.__('forms.settings.success');
}
