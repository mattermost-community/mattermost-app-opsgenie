import {AppBinding, AppsState, BindingOptions} from '../types';

import {
    createAlertBinding,
    getHelpBinding,
    getConfigureBinding,
    getAllBinding,
    addNoteToAlertBinding,
    closeAlertBinding,
    ackAlertBinding,
    unackAlertBinding,
    snoozeAlertBinding
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
        Commands.NOTE,
        Commands.TEAM,
        Commands.CLOSE,
        Commands.ACK,
        Commands.UNACK,
        Commands.SNOOZE
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
            bindings.push(getConfigureBinding());
            bindings.push(getAllBinding());
            bindings.push(addNoteToAlertBinding());
            bindings.push(closeAlertBinding());
            bindings.push(ackAlertBinding());
            bindings.push(unackAlertBinding());
            bindings.push(snoozeAlertBinding());
            return newCommandBindings(bindings);
        }
    }

    bindings.push(getHelpBinding());
    bindings.push(createAlertBinding());
    bindings.push(getConfigureBinding());
    bindings.push(getAllBinding());
    bindings.push(addNoteToAlertBinding());
    bindings.push(closeAlertBinding());
    bindings.push(ackAlertBinding());
    bindings.push(unackAlertBinding());
    bindings.push(snoozeAlertBinding());
    return newCommandBindings(bindings);
};

