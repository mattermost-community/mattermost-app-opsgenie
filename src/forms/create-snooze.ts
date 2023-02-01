import { addDays, addHours, addMinutes, endOfDay, format } from 'date-fns';

import {
    Alert,
    AlertSnooze,
    AppCallAction,
    AppCallRequest,
    AppCallValues,
    AppContextAction,
    Identifier,
    IdentifierType,
} from '../types';
import {
    ExceptionType,
    SnoozeAlertForm,
    option_time_10m,
    option_time_15m,
    option_time_1d,
    option_time_1h,
    option_time_2h,
    option_time_30m,
    option_time_5m,
    option_time_6h,
} from '../constant';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { configureI18n } from '../utils/translations';
import { getAlertLink, tryPromise } from '../utils/utils';
import { canUserInteractWithAlert, getOpsGenieAPIKey } from '../utils/user-mapping';
import { Exception } from '../utils/exception';

export async function createSnoozeAlertCall(call: AppCallRequest): Promise<string> {
    const username: string | undefined = call.context.acting_user?.username;
    const values: AppCallValues | undefined = call.values;
    const i18nObj = configureI18n(call.context);
    const apiKey = getOpsGenieAPIKey(call);

    if (!values) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('general.validation-form.values-not-found'), call.context.mattermost_site_url, call.context.app_path);
    }

    const alertTinyId: string = values?.[SnoozeAlertForm.NOTE_TINY_ID];
    const timeAmount: string = values?.[SnoozeAlertForm.TIME_AMOUNT].value;

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: apiKey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY,
    };
    const alert: Alert = await canUserInteractWithAlert(call, alertTinyId);
    const alertURL: string = await getAlertLink(alertTinyId, alert.id, opsGenieClient, call.context.mattermost_site_url, call.context.app_path);

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
        user: username,
    };
    await tryPromise(opsGenieClient.snoozeAlert(identifier, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);
    return i18nObj.__('forms.create-snooze.response', { url: alertURL, time: timeAmount });
}

export async function createSnoozeAlertAction(call: AppCallAction<AppContextAction>): Promise<string> {
    const username: string = call.context.acting_user.username;
    const i18nObj = configureI18n(call.context);
    const apiKey = getOpsGenieAPIKey(call);

    const alert = call.state.alert;
    const timeAmount: string = call.values.timeselectevent?.value;

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: apiKey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const identifier: Identifier = {
        identifier: <string>alert.tinyId,
        identifierType: IdentifierType.TINY,
    };
    await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);
    const alertURL: string = await getAlertLink(<string>alert.tinyId, alert.id, opsGenieClient, call.context.mattermost_site_url, call.context.app_path);

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
        user: username,
    };
    await tryPromise(opsGenieClient.snoozeAlert(identifier, data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);

    return i18nObj.__('api.list-alert.message-alert-snoozed', { alert: alertURL, timeAmount });
}
