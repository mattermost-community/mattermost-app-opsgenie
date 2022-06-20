import {AlertNote, AppCallRequest, AppCallValues, Identifier, IdentifierType} from '../types';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {ExceptionType, NoteCreateForm, StoreKeys} from '../constant';
import {tryPromise} from '../utils/utils';
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
    await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, 'OpsGenie failed');

    const data: AlertNote = {
        note: alertMessage,
        user: username
    };
    await tryPromise(opsGenieClient.addNoteToAlert(identifier, data), ExceptionType.MARKDOWN,  'OpsGenie failed');
}
