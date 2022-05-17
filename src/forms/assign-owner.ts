import {
    AppCallRequest,
    AppForm,
    AlertIdentifier,
    ResponseResult,
    AssignOwnerToAlertCreate
} from '../types';
import {newOpsgenieClient, OpsGenieClient, OpsGenieClientOptions} from '../clients/opsgenie';
import {OpsGenieIcon, Routes} from "../constant";

export async function assignOwnerAlertForm(call: AppCallRequest): Promise<AppForm> {
    console.log('call', call);
    const opsgenieOptions: OpsGenieClientOptions = {
        oauth2UserAccessToken: ''
    };
    const opsgenieClient: OpsGenieClient = await newOpsgenieClient(opsgenieOptions);
    const alertIdentifier: AlertIdentifier = {
        identifier: "55487914-e2c5-43cf-80d3-a6d9cba5ded8-1652463057998",
        identifierType : "id"
    };

    const assignOwnerToAlertCreate: AssignOwnerToAlertCreate = {
        note : "some note for snooze action",
        user : "lizeth@ancient.mx",
        source : "source of the snooze request",
        owner: {
            username: 'lizeth@ancient.mx'
        }
    };

    return new Promise((resolve, rejects) => {
        opsgenieClient.alertV2.assign(alertIdentifier, assignOwnerToAlertCreate, function (error: any, result: ResponseResult) {
            console.log('error', error);
            console.log('result', result);
            if (error) {
                return rejects(error);
            }

            const form: any = {
                title: 'Create OpsGenie Assign Owner to Alert',
                header: 'Create a OpsGenie assign owner to alert from Mattermost by filling out and submitting this form. Additional text can be added in the `Optional Message` field.',
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
