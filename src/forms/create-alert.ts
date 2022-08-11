import {AlertCreate, AlertResponderType, AppCallRequest, AppCallValues, Identifier, IdentifierType} from '../types';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {AlertCreateForm, ExceptionType, option_alert_priority_p3, StoreKeys} from '../constant';
import { tryPromise } from '../utils/utils';

export async function createAlertCall(call: AppCallRequest): Promise<string> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const values: AppCallValues | undefined = call.values;

    const message: string = values?.[AlertCreateForm.ALERT_MESSAGE];
    const priority: string = values?.[AlertCreateForm.ALERT_PRIORITY]?.value || option_alert_priority_p3;
    const teamName: string = values?.[AlertCreateForm.TEAM_NAME];

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const config: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: config.opsgenie_apikey
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const identifier: Identifier = {
        identifier: teamName,
        identifierType: IdentifierType.NAME,
    };
    await tryPromise(opsGenieClient.getTeam(identifier), ExceptionType.MARKDOWN, 'OpsGenie failed');

    const alertCreate: AlertCreate = {
        message,
        priority,
        responders: [
            {
                name: teamName,
                type: AlertResponderType.TEAM
            }
        ]
    };
    await tryPromise(opsGenieClient.createAlert(alertCreate), ExceptionType.MARKDOWN, 'OpsGenie failed');
    return `New alert "${message}" will be created`
}
