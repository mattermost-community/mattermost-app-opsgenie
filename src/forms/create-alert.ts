import {
    AlertCreate,
    AppCallRequest
} from '../types';
import {OpsGenieClient} from '../clients/opsgenie';

export async function newCreateAlertForm(call: AppCallRequest): Promise<void> {
    const message: string = call.values?.message;

    const opsGenieClient = new OpsGenieClient();

    const alertCreate: AlertCreate = {
        message
    };
    await opsGenieClient.createAlert(alertCreate);
}
