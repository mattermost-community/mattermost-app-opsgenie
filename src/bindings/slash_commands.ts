import {AppActingUser, AppBinding, AppCallRequest, AppsState} from '../types';

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
import {existsKvOpsGenieConfig, isUserSystemAdmin} from "../utils/utils";
import {KVStoreClient, KVStoreOptions} from "../clients/kvstore";

const newCommandBindings = (bindings: AppBinding[], commands: string[]): AppsState => {
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

export const getCommandBindings = async (call: AppCallRequest): Promise<AppsState> => {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const actingUser: AppActingUser | undefined = call.context.acting_user;

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvClient = new KVStoreClient(options);

    const bindings: AppBinding[] = [];
    const commands: string[] = [
        Commands.HELP
    ];

    bindings.push(getHelpBinding());

    if (isUserSystemAdmin(<AppActingUser>actingUser)) {
        bindings.push(getConfigureBinding());
        commands.push(Commands.CONFIGURE);
    }  
    if (await existsKvOpsGenieConfig(kvClient)) {
        commands.push(Commands.ACCOUNT);
        commands.push(Commands.SUBSCRIPTION);
        commands.push(Commands.ALERT);
        commands.push(Commands.LIST);
        bindings.push(connectAccountBinding());
        bindings.push(subscriptionBinding());
        bindings.push(alertBinding());
        bindings.push(getAllBinding());
    }

    return newCommandBindings(bindings, commands);
};

