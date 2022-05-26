import {AppCallRequest, AppForm} from '../types';
import {AppFieldTypes, ConfigureForm, OpsGenieIcon, Routes, StoreKeys} from '../constant';
import {ConfigStoreProps, KVStore, KVStoreOptions} from '../clients/kvstore';

export async function opsGenieConfigForm(call: AppCallRequest): Promise<AppForm> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient = new KVStore(options);

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
