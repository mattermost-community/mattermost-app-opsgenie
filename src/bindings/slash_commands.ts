import { AppActingUser, AppBinding, AppCallRequest, AppContext, AppsState, Oauth2App } from '../types';

import {
    AppBindingLocations,
    CommandTrigger,
    Commands,
    OpsGenieIcon,
} from '../constant';
import { allowMemberAction } from '../utils/user-mapping';
import { existsOpsGenieAPIKey, isUserSystemAdmin } from '../utils/utils';
import { configureI18n } from '../utils/translations';

import {
    alertBinding,
    getConfigureBinding,
    getHelpBinding,
    getSettingsBinding,
    getTeamBinding,
    subscriptionBinding,
} from './bindings';

const newCommandBindings = (context: AppContext, bindings: AppBinding[], commands: string[]): AppsState => {
    const i18nObj = configureI18n(context);
    return {
        location: AppBindingLocations.COMMAND,
        bindings: [
            {
                icon: OpsGenieIcon,
                label: CommandTrigger,
                hint: `[${commands.join(' | ')}]`,
                description: i18nObj.__('bindings-descriptions.bindings'),
                bindings,
            },
        ],
    };
};

export const getCommandBindings = (call: AppCallRequest): AppsState => {
    const actingUser: AppActingUser | undefined = call.context.acting_user;
    const oauth2: Oauth2App = call.context.oauth2 as Oauth2App;
    const context = call.context as AppContext;

    const bindings: AppBinding[] = [];
    const commands: string[] = [
        Commands.HELP,
    ];

    bindings.push(getHelpBinding(context));

    if (isUserSystemAdmin(<AppActingUser>actingUser)) {
        bindings.push(getConfigureBinding(context));
        commands.push(Commands.CONFIGURE);
    }
    if (existsOpsGenieAPIKey(oauth2)) {
        if (isUserSystemAdmin(<AppActingUser>actingUser)) {
            commands.push(Commands.SETTINGS);
            bindings.push(getSettingsBinding(context));
        }

        if (allowMemberAction(context)) {
            commands.push(Commands.SUBSCRIPTION);
            bindings.push(subscriptionBinding(context));
        }
        commands.push(Commands.ALERT);
        commands.push(Commands.TEAM);
        bindings.push(alertBinding(context));
        bindings.push(getTeamBinding(context));
    }

    return newCommandBindings(context, bindings, commands);
};

