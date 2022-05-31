import {
    Alert,
    AppCallRequest,
    AppCallValues,
    Identifier,
    IdentifierType, PriorityAlert, ResponseResultWithData
} from '../types';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {PriorityAlertForm, StoreKeys} from '../constant';
import {tryPromiseOpsgenieWithMessage} from '../utils/utils';

export async function priorityAlertCall(call: AppCallRequest): Promise<void> {
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
    const responseAlert: ResponseResultWithData<Alert> = await tryPromiseOpsgenieWithMessage(opsGenieClient.getAlert(identifier), 'OpsGenie failed');
    const alert: Alert = responseAlert.data;

    if (alert.priority === priority) {
        throw new Error(`Update priority request will be processed for #${alert.tinyId}`);
    }

    const priorityAlert: PriorityAlert = {
        priority,
        user: username
    };
    await tryPromiseOpsgenieWithMessage(opsGenieClient.updatePriorityToAlert(identifier, priorityAlert), 'OpsGenie failed');
}
