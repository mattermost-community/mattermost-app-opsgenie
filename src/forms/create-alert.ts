import {AlertCreate, AppCallRequest, AppForm, ResponseResult} from '../types';
import {newOpsgenieClient, OpsGenieClient, OpsGenieClientOptions} from '../clients/opsgenie';
import {OpsGenieIcon, Routes} from "../constant";

export async function newCreateAlertForm(call: AppCallRequest): Promise<AppForm> {
    console.log('call', call);
    const opsgenieOptions: OpsGenieClientOptions = {
        oauth2UserAccessToken: ''
    };
    const opsgenieClient: OpsGenieClient = await newOpsgenieClient(opsgenieOptions);
    const payload: AlertCreate = {
        message: 'Hola se creo alerta desde el comando'
    };

    return new Promise((resolve, rejects) => {
        opsgenieClient.alertV2.create(payload, function (error: any, result: ResponseResult) {
            if (error) {
                return rejects(error);
            }

            const form: AppForm = {
                title: 'Create OpsGenie Alert',
                header: 'Create a OpsGenie alert from Mattermost by filling out and submitting this form. Additional text can be added in the `Optional Message` field.',
                icon: OpsGenieIcon,
                fields: [],
                call: {
                    path: Routes.App.CallPathAlertSubmitOrUpdate,
                },
            };

            return resolve(form);
        });
    });
}
