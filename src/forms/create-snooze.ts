import {addHours, addMinutes, addDays, format, endOfDay} from 'date-fns';
import {
    Alert,
    AlertSnooze,
    AppCallAction,
    AppCallRequest,
    AppCallValues,
    AppContextAction,
    Identifier,
    IdentifierType,
    ResponseResultWithData
} from '../types';
import {
    ExceptionType,
    option_time_10m,
    option_time_15m,
    option_time_1d,
    option_time_1h,
    option_time_2h,
    option_time_30m,
    option_time_5m,
    option_time_6h,
    SnoozeAlertForm,
    StoreKeys
} from '../constant';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {getAlertLink, tryPromise} from '../utils/utils';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';

export async function createSnoozeAlertCall(call: AppCallRequest): Promise<string> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const username: string | undefined = call.context.acting_user?.username;
    const values: AppCallValues | undefined = call.values;

    const alertTinyId: string = values?.[SnoozeAlertForm.NOTE_TINY_ID];
    const timeAmount: string = values?.[SnoozeAlertForm.TIME_AMOUNT].value;

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
    const response: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, 'OpsGenie failed');
    const alert: Alert = response.data;
    const alertURL: string = await getAlertLink(alertTinyId, alert.id, opsGenieClient);


    const currentDate: Date = new Date();
    const date: { [key: string]: Date } = {
        [option_time_5m]: addMinutes(currentDate, 5),
        [option_time_10m]: addMinutes(currentDate, 10),
        [option_time_15m]: addMinutes(currentDate, 15),
        [option_time_30m]: addMinutes(currentDate, 30),
        [option_time_1h]: addHours(currentDate, 1),
        [option_time_2h]: addHours(currentDate, 2),
        [option_time_6h]: addHours(currentDate, 6),
        [option_time_1d]: addDays(currentDate, 1),
    };

    const endTime: string = date[timeAmount].toISOString();
    const data: AlertSnooze = {
        endTime,
        user: username
    };
    await tryPromise(opsGenieClient.snoozeAlert(identifier, data),  ExceptionType.MARKDOWN, 'OpsGenie failed');
    return `Alert ${alertURL} will be snoozed for ${timeAmount}`
}

export async function createSnoozeAlertAction(call: AppCallAction<AppContextAction>): Promise<Alert> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const postId: string = call.post_id;
    const username: string | undefined = call.user_name;

    const alertTinyId: string | undefined = call.context.alert.tinyId;
    const timeAmount: string | undefined = call.context.selected_option;

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const config: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: botAccessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: config.opsgenie_apikey
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY
    };
    const responseAlert: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, 'OpsGenie failed');

    const currentDate: Date = new Date();
    const date: { [key: string]: Date } = {
        [option_time_5m]: addMinutes(currentDate, 5),
        [option_time_10m]: addMinutes(currentDate, 10),
        [option_time_15m]: addMinutes(currentDate, 15),
        [option_time_30m]: addMinutes(currentDate, 30),
        [option_time_1h]: addHours(currentDate, 1),
        [option_time_2h]: addHours(currentDate, 2),
        [option_time_6h]: addHours(currentDate, 6),
        [option_time_1d]: addDays(currentDate, 1),
    };

    const endTime: string = format(endOfDay(date[<string>timeAmount]), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
    const data: AlertSnooze = {
        endTime,
        user: username
    };
    await tryPromise(opsGenieClient.snoozeAlert(identifier, data), ExceptionType.MARKDOWN, 'OpsGenie failed');
    await mattermostClient.deletePost(postId);
    
    return responseAlert.data;
}
