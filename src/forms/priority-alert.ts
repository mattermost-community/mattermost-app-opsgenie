import {
    Alert,
    AppCallRequest,
    AppCallValues,
    Identifier,
    IdentifierType,
    PriorityAlert,
    ResponseResultWithData
} from '../types';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {ExceptionType, PriorityAlertForm, StoreKeys} from '../constant';
import {getAlertLink, tryPromise} from '../utils/utils';
import {Exception} from '../utils/exception';

export async function priorityAlertCall(call: AppCallRequest): Promise<string> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const username: string | undefined = call.context.acting_user?.username;
    const values: AppCallValues | undefined = call.values;

    const alertTinyId: string = values?.[PriorityAlertForm.NOTE_TINY_ID];
    const priority: string = values?.[PriorityAlertForm.ALERT_PRIORITY]?.value;

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
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY
    };
    const responseAlert: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, 'OpsGenie failed');
    const alert: Alert = responseAlert.data;
    const alertURL: string = await getAlertLink(alertTinyId, alert.id, opsGenieClient);

    if (alert.priority === priority) {
        throw new Exception(ExceptionType.MARKDOWN, `Alert's ${alertURL} priority is already ${priority}`);
    }

    const priorityAlert: PriorityAlert = {
        priority,
        user: username
    };
    await tryPromise(opsGenieClient.updatePriorityToAlert(identifier, priorityAlert), ExceptionType.MARKDOWN, 'OpsGenie failed');
    return `Updated ${alertURL} priority to ${priority}`;
}
