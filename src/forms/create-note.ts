import {
    Alert,
    AlertNote,
    AppCallDialog,
    AppCallRequest,
    AppCallValues,
    AppContextAction,
    Identifier,
    IdentifierType,
    ResponseResultWithData
} from '../types';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {ExceptionType, NoteCreateForm, StoreKeys} from '../constant';
import {tryPromise} from '../utils/utils';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';

export async function addNoteToAlertCall(call: AppCallRequest): Promise<string> {
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
    const alertResponse: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, 'OpsGenie failed');
    const alert: Alert = alertResponse.data;
    
    const data: AlertNote = {
        note: alertMessage,
        user: username
    };
    await tryPromise(opsGenieClient.addNoteToAlert(identifier, data), ExceptionType.MARKDOWN,  'OpsGenie failed');
    return `Note will be added for #${alert.tinyId}`;
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
    const responseAlert: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, 'OpsGenie failed');

    const data: AlertNote = {
        note: alertMessage
    };
    await tryPromise(opsGenieClient.addNoteToAlert(identifier, data), ExceptionType.MARKDOWN, 'OpsGenie failed');
    return responseAlert.data;
}