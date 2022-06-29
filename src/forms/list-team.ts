import {AppCallRequest, ResponseResultWithData, Teams} from '../types';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {ExceptionType, StoreKeys} from '../constant';
import {tryPromise} from '../utils/utils';

export async function getAllTeamsCall(call: AppCallRequest): Promise<Teams[]> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;

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

    const teams: ResponseResultWithData<Teams[]> = await tryPromise(opsGenieClient.getAllTeams(), ExceptionType.MARKDOWN, 'OpsGenie failed');
    return teams.data;
}
