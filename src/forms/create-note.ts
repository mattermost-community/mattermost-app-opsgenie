import {
    AlertNote,
    AppCallRequest,
    AppCallValues,
    Identifier,
    IdentifierType
} from '../types';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {NoteCreateForm, StoreKeys} from '../constant';
import {tryPromiseOpsgenieWithMessage} from '../utils/utils';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';

export async function newModalNoteToAlert(call: AppCallRequest): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
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
    const data: AlertNote = {
        note: alertMessage
    }

    await tryPromiseOpsgenieWithMessage(opsGenieClient.addNoteToAlert(identifier, data), 'OpsGenie failed');
}
