import {
    Alert,
    AlertAssign,
    AppCallAction,
    AppCallRequest,
    AppCallValues,
    AppContext,
    AppContextAction,
    Identifier,
    IdentifierType,
    ResponseResultWithData, User,
} from '../types';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { ConfigStoreProps, KVStoreClient, KVStoreOptions } from '../clients/kvstore';
import { AssignAlertForm, ExceptionType, StoreKeys } from '../constant';
import { configureI18n } from '../utils/translations';
import { getAlertLink, tryPromise } from '../utils/utils';

export async function assignAlertCall(call: AppCallRequest): Promise<string> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const username: string | undefined = call.context.acting_user?.username;
    const values: AppCallValues | undefined = call.values;
    const i18nObj = configureI18n(call.context);

    const userId: string = values?.[AssignAlertForm.USER_ID].value;
    const alertTinyId: string = values?.[AssignAlertForm.NOTE_TINY_ID];

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
    const mattermostUser: User = await mattermostClient.getUser(userId);

    const identifierUser: Identifier = {
        identifier: mattermostUser.email,
        identifierType: IdentifierType.USERNAME,
    };
    await tryPromise(opsGenieClient.getUser(identifierUser), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));

    const identifierAlert: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY,
    };
    const responseAlert: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifierAlert), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
    const alert = responseAlert.data;
    const alertURL: string = await getAlertLink(alertTinyId, alert.id, opsGenieClient);

    const data: AlertAssign = {
        user: username,
        owner: {
            username: mattermostUser.email,
        },
        note: i18nObj.__('forms.message-note'),
    };
    await tryPromise(opsGenieClient.assignAlert(identifierAlert, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
    return i18nObj.__('forms.response-assign-alert', { url: alertURL, email: mattermostUser.email });
}

export async function assignAlertAction(call: AppCallAction<AppContextAction>, context: AppContext): Promise<Alert> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const username: string | undefined = call.user_name;
    const postId: string | undefined = call.post_id;
    const userId: string | undefined = call.context.selected_option;
    const alert: any = call.context.alert;
    const i18nObj = configureI18n(context);

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

    const identifierAlert: Identifier = {
        identifier: alert.tinyId,
        identifierType: IdentifierType.TINY,
    };
    const responseAlert: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifierAlert), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));

    const data: AlertAssign = {
        user: username,
        owner: {
            username: mattermostUser.email,
        },
    };
    await tryPromise(opsGenieClient.assignAlert(identifierAlert, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));

    await mattermostClient.deletePost(postId);

    return responseAlert.data;
}
