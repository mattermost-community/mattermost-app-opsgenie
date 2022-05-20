import {
    AppCallAction,
    CloseAlertAction,
    DialogProps,
} from '../types';
import {MattermostClient, MattermostOptions} from '../clients/mattermost';
import {Routes} from '../constant';
import config from '../config';

export async function otherActionsAlertCall(call: AppCallAction<CloseAlertAction>): Promise<void> {
    console.log('call', call);
    const mattermostUrl: string = call.context.mattermost_site_url;
    const triggerId: string = call.trigger_id;
    const accessToken: string = call.context.bot_access_token;

    const mattermostOptions: MattermostOptions = {
        mattermostUrl,
        accessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    const url: string = `${config.APP.HOST}${Routes.App.CallPathNoteToAlertModal}`;
    const dialogProps: DialogProps = {
        trigger_id: triggerId,
        url,
        dialog: {
            title: 'Add Note',
            elements: [
                {
                    display_name: 'Note',
                    type: 'textarea',
                    name: 'note',
                    placeholder: 'Your note here...',
                    optional: false
                }
            ],
        }
    }
    try {
        await mattermostClient.showDialog(dialogProps);
    } catch (error) {
        console.log('error', error)
    }
}
