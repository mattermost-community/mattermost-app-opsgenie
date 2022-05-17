import {AppBinding} from '../types';
import {AppBindingLocations, Commands, CommandTrigger, OpsGenieIcon} from '../constant';

export const newCommandBindings = (bindings: AppBinding[]): any => {
    return {
        location: AppBindingLocations.COMMAND,
        bindings: [
            {
                icon: OpsGenieIcon,
                label: CommandTrigger,
                hint: `[${Commands.HELP} | ${Commands.ALERT}]`,
                description: 'Manage OpsGenie alert',
                bindings,
            },
        ],
    };
};
