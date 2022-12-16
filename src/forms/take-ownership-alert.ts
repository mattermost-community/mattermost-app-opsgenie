import {
    Alert,
    AlertAssign,
    AppCallAction,
    AppCallRequest,
    AppCallValues,
    AppContextAction,
    Identifier,
    IdentifierType,
    ResponseResultWithData,
    User,
} from '../types';
import { AckAlertForm, ExceptionType, StoreKeys, TakeOwnershipAlertForm } from '../constant';
import { ConfigStoreProps, KVStoreClient, KVStoreOptions } from '../clients/kvstore';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { configureI18n } from '../utils/translations';
import { getAlertLink, tryPromise } from '../utils/utils';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';
import { Exception } from '../utils/exception';

export async function takeOwnershipAlertCall(call: AppCallAction<AppContextAction>): Promise<string> {
    const mattermostUrl: string = call.context.mattermost_site_url;
    const botAccessToken: string = call.context.bot_access_token;
    const username: string = call.context.acting_user.username;
    const userId: string = call.context.acting_user.id;
    const values: AppCallValues | undefined = call.values;
    const i18nObj = configureI18n(call.context);
    const alertTinyId: string = typeof values?.[AckAlertForm.NOTE_TINY_ID] === 'undefined' ?
        call.state.alert.tinyId as string :
        values?.[AckAlertForm.NOTE_TINY_ID];

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };

    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);
    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const kvConfig: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);
    const opsGenieOpt: OpsGenieOptions = {
        api_key: kvConfig.opsgenie_apikey,
    };
    const opsGenieClient = new OpsGenieClient(opsGenieOpt);

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

    if (alert.owner === mattermostUser.email) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.actions.exception-owner', { alert: alertURL }));
    }

    const data: AlertAssign = {
        user: username,
        owner: {
            username: mattermostUser.email,
        },
    };

    await tryPromise(opsGenieClient.assignAlert(identifier, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));

    return i18nObj.__('forms.actions.response-owner', { alert: alertURL });
}
