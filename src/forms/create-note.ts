import {AppCallRequest, AppForm, NoteToAlertCreate, Identifier} from '../types';
import {OpsGenieIcon, Routes} from '../constant';

export function newModalNoteToAlert(call: AppCallRequest): any {
    const form: any = {
        title: 'Create OpsGenie Note to Alert',
        header: 'Create a OpsGenie note to alert from Mattermost by filling out and submitting this form. Additional text can be added in the `Optional Message` field.',
        icon: OpsGenieIcon,
        fields: [],
        call: {
            path: Routes.App.CallPathAlertSubmitOrUpdate,
        },
    };

    return form;
}

export async function newCreateNoteToAlertForm(call: AppCallRequest): Promise<AppForm> {
    console.log('call', call);
    const alertIdentifier: Identifier = {
        identifier: '09ee15ab-583f-4db8-a2c2-0b6b32d2a076-1652394212357',
        identifierType: 'id'
    };
    const noteToAlertCreate: NoteToAlertCreate = {
        note: 'Creando una nota desde comando',
        source: '',
        user: 'lizeth@ancient.mx'
    };

    return new Promise((resolve, rejects) => {
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
}
