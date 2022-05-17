import {AppCallRequest, AppForm, NoteToAlertCreate, AlertIdentifier, ResponseResult} from '../types';
import {newOpsgenieClient, OpsGenieClient, OpsGenieClientOptions} from '../clients/opsgenie';
import {OpsGenieIcon, Routes} from "../constant";

export async function newCreateNoteToAlertForm(call: AppCallRequest): Promise<AppForm> {
    console.log('call', call);
    const opsgenieOptions: OpsGenieClientOptions = {
        oauth2UserAccessToken: ''
    };
    const opsgenieClient: OpsGenieClient = await newOpsgenieClient(opsgenieOptions);
    const alertIdentifier: AlertIdentifier = {
        identifier: '09ee15ab-583f-4db8-a2c2-0b6b32d2a076-1652394212357',
        identifierType: 'id'
    };
    const noteToAlertCreate: NoteToAlertCreate = {
        note: 'Creando una nota desde comando',
        source: '',
        user: 'lizeth@ancient.mx'
    };

    return new Promise((resolve, rejects) => {
        opsgenieClient.alertV2.addNote(alertIdentifier, noteToAlertCreate, function (error: any, result: ResponseResult) {
            console.log('error', error);
            console.log('result', result);
            if (error) {
                return rejects(error);
            }

            const form: any = {
                title: 'Create OpsGenie Note to Alert',
                header: 'Create a OpsGenie note to alert from Mattermost by filling out and submitting this form. Additional text can be added in the `Optional Message` field.',
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
