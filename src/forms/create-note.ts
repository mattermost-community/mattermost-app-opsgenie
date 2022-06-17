import {
    Alert,
    AlertNote,
    AppCallAction,
    AppCallDialog,
    AppCallRequest,
    AppCallValues,
    AppContextAction,
    Identifier,
    IdentifierType,
    ResponseResultWithData
} from '../types';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {NoteCreateForm, StoreKeys} from '../constant';
import {tryPromiseOpsgenieWithMessage} from '../utils/utils';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';

export async function addNoteToAlertCall(call: AppCallRequest): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const username: string | undefined = call.context.acting_user?.username;
    const values: AppCallValues | undefined = call.values;

    const alertMessage: string = values?.[NoteCreateForm.NOTE_MESSAGE];
    const alertTinyId: string = values?.[NoteCreateForm.NOTE_TINY_ID];

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
    await tryPromiseOpsgenieWithMessage(opsGenieClient.getAlert(identifier), 'OpsGenie failed');

    const data: AlertNote = {
        note: alertMessage,
        user: username
    };
    await tryPromiseOpsgenieWithMessage(opsGenieClient.addNoteToAlert(identifier, data), 'OpsGenie failed');
}

export async function addNoteToAlertAction(call: AppCallDialog<{ alert_message: string }>): Promise<Alert> {
    const context: AppContextAction = JSON.parse(call.state);
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;

    const alertMessage: string = call.submission.alert_message;
    const alertTinyId: string = context.alert.tinyId;

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

    const data: AlertNote = {
        note: alertMessage
    };
    await tryPromiseOpsgenieWithMessage(opsGenieClient.addNoteToAlert(identifier, data), 'OpsGenie failed');
    return responseAlert.data;
}