import {
    Alert,
    AlertAssign,
    AppCallRequest,
    AppCallValues,
    Identifier,
    IdentifierType,
    ResponseResultWithData,
    User,
} from '../types';
import { ExceptionType, StoreKeys, TakeOwnershipAlertForm } from '../constant';
import { ConfigStoreProps, KVStoreClient, KVStoreOptions } from '../clients/kvstore';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { configureI18n } from '../utils/translations';
import { getAlertLink, tryPromise } from '../utils/utils';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';
import { Exception } from '../utils/exception';

export async function takeOwnershipAlertCall(call: AppCallRequest): Promise<string> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const username: string | undefined = call.context.acting_user?.username;
    const userId: string | undefined = call.context.acting_user?.id;
    const values: AppCallValues | undefined = call.values;
    const i18nObj = configureI18n(call.context);

    const alertTinyId: string = values?.[TakeOwnershipAlertForm.NOTE_TINY_ID];

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const config: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: config.opsgenie_apikey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: botAccessToken,
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    const mattermostUser: User = await mattermostClient.getUser(<string>userId);

    const identifierUser: Identifier = {
        identifier: mattermostUser.email,
        identifierType: IdentifierType.USERNAME,
    };
    await tryPromise(opsGenieClient.getUser(identifierUser), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));

    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY,
    };
    const responseAlert: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
    const alert: Alert = responseAlert.data;
    const alertURL: string = await getAlertLink(alertTinyId, alert.id, opsGenieClient);

    if (!alert.owner || alert.owner === mattermostUser.email) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.ownership.exception', { url: alertURL }));
    }

    const data: AlertAssign = {
        user: username,
        owner: {
            username: mattermostUser.email,
        },
    };
    await tryPromise(opsGenieClient.assignAlert(identifier, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
    return i18nObj.__('forms.ownership.response', { url: alertURL });
}
