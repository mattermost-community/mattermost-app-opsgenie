import {AppBinding, AppsState, BindingOptions} from '../types';

import {
    createAlertBinding,
    getHelpBinding,
    getConfigureBinding,
    getAllTeamsBinding
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
        Commands.TEAM
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
            bindings.push(createAlertBinding());
            bindings.push(getConfigureBinding())
            bindings.push(getAllTeamsBinding())
            return newCommandBindings(bindings);
        }
    }

    bindings.push(getHelpBinding());
    bindings.push(createAlertBinding());
    bindings.push(getConfigureBinding())
    bindings.push(getAllTeamsBinding())
    return newCommandBindings(bindings);
};

