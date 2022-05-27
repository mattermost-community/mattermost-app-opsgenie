import {AppBinding, AppsState, BindingOptions} from '../types';

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
                hint: `[${Commands.HELP} | ${Commands.CONFIGURE} | ${Commands.ALERT}]`,
                description: 'Manage OpsGenie',
                bindings,
            },
        ],
    };
};

export const getCommandBindings = (options: BindingOptions): AppsState => {
    const bindings: AppBinding[] = [];
    console.log('options bindings', options);
    if (!options.isConfigured) {
        if (options.isSystemAdmin) {
            bindings.push(getHelpBinding());
            bindings.push(createAlertBinding());
            bindings.push(getConfigureBinding())
            return newCommandBindings(bindings);        }
    }

    bindings.push(getHelpBinding());
    bindings.push(createAlertBinding());
    bindings.push(getConfigureBinding())
    return newCommandBindings(bindings);
};

