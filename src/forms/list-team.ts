import { AppCallRequest, Oauth2App, ResponseResultWithData, Teams } from '../types';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { ExceptionType } from '../constant';
import { configureI18n } from '../utils/translations';
import { tryPromise } from '../utils/utils';
import { getOpsGenieAPIKey } from '../utils/user-mapping';

export async function getAllTeamsCall(call: AppCallRequest): Promise<Teams[]> {
    const i18nObj = configureI18n(call.context);
    const apiKey = getOpsGenieAPIKey(call);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: apiKey
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const teams: ResponseResultWithData<Teams[]> = await tryPromise(opsGenieClient.getAllTeams(), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
    return teams.data;
}
