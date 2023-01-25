import { Account, Alert, AppCallRequest, ListAlertParams, ResponseResultWithData } from '../types';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { ExceptionType } from '../constant';
import { configureI18n } from '../utils/translations';
import { tryPromise } from '../utils/utils';
import { getOpsGenieAPIKey } from '../utils/user-mapping';

export async function getAllAlertCall(call: AppCallRequest): Promise<[Alert[], Account]> {
    const i18nObj = configureI18n(call.context);
    const apiKey = getOpsGenieAPIKey(call);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: apiKey,
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const params: ListAlertParams = {
        limit: 100,
    };
    const teams: ResponseResultWithData<Alert[]> = await tryPromise(opsGenieClient.listAlert(params), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));

    const account: ResponseResultWithData<Account> = await tryPromise(opsGenieClient.getAccount(), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));

    return [teams.data, account.data];
}
