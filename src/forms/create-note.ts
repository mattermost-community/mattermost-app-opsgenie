import {AddNoteDialogForm, AlertNote, AppCallDialog, Identifier, IdentifierType} from '../types';
import {OpsGenieClient} from '../clients/opsgenie';

export async function newModalNoteToAlert(call: AppCallDialog<AddNoteDialogForm>): Promise<void> {
    const alertTinyId: string = call.state;
    const dataForm: AddNoteDialogForm = call.submission;

    const opsGenieClient = new OpsGenieClient();

    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY
    };
    const data: AlertNote = {
        note: dataForm.note
    }
    await opsGenieClient.addNoteToAlert(identifier, data);
}
