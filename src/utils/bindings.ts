import {AppBinding} from '../types';
import {AppBindingLocations, CommandTrigger, OpsGenieIcon} from '../constant';
import manifest from '../manifest.json';

export const newCommandBindings = (bindings: AppBinding[]): AppBinding => {
    return {
        app_id: manifest.app_id,
        label: CommandTrigger,
        location: AppBindingLocations.COMMAND,
        bindings: [
            {
                app_id: manifest.app_id,
                icon: OpsGenieIcon,
                label: CommandTrigger,
                description: 'Manage Zendesk tickets',
                hint: '',
                bindings,
            },
        ],
    };
};
