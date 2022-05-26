import {AppBinding, AppsState} from '../types';

import {
    createAlertBinding,
    getHelpBinding,
    getConfigureBinding
} from './bindings';
import {AppBindingLocations, Commands, CommandTrigger, OpsGenieIcon} from "../constant";

const newCommandBindings = (bindings: AppBinding[]): AppsState => {
    return {
        location: AppBindingLocations.COMMAND,
        bindings: [
            {
                icon: OpsGenieIcon,
                label: CommandTrigger,
                hint: `[${Commands.HELP} | ${Commands.ALERT}]`,
                description: 'Manage OpsGenie',
                bindings,
            },
        ],
    };
};

export const getCommandBindings = (): AppsState => {
    const bindings: AppBinding[] = [];

    bindings.push(getHelpBinding());
    bindings.push(createAlertBinding());
    bindings.push(getConfigureBinding())
    return newCommandBindings(bindings);
};

