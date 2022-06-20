import {AppBinding, AppsState, BindingOptions} from '../types';

import {
    alertBinding,
    getHelpBinding,
    getConfigureBinding,
    getAllBinding,
    connectAccountBinding,
    subscriptionBinding
} from './bindings';
import {
    AppBindingLocations,
    Commands,
    CommandTrigger,
    OpsGenieIcon
} from '../constant';

const newCommandBindings = (bindings: AppBinding[]): AppsState => {
    const commands: string[] = [
        Commands.HELP,
        Commands.CONFIGURE,
        Commands.ALERT,
        Commands.LIST,
        Commands.ACCOUNT
    ];

    return {
        location: AppBindingLocations.COMMAND,
        bindings: [
            {
                icon: OpsGenieIcon,
                label: CommandTrigger,
                hint: `[${commands.join(' | ')}]`,
                description: 'Manage OpsGenie',
                bindings,
            },
        ],
    };
};

export const getCommandBindings = (options: BindingOptions): AppsState => {
    const bindings: AppBinding[] = [];
    if (!options.isConfigured) {
        if (options.isSystemAdmin) {
            bindings.push(getHelpBinding());
            bindings.push(connectAccountBinding());
            bindings.push(subscriptionBinding());
            bindings.push(alertBinding());
            bindings.push(getConfigureBinding());
            bindings.push(getAllBinding());
            return newCommandBindings(bindings);
        }
    }

    bindings.push(getHelpBinding());
    bindings.push(connectAccountBinding());
    bindings.push(subscriptionBinding());
    bindings.push(alertBinding());
    bindings.push(getConfigureBinding());
    bindings.push(getAllBinding());
    return newCommandBindings(bindings);
};

