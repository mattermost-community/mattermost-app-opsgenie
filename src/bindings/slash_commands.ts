import {AppActingUser, AppBinding, AppCallRequest, AppContext, AppsState} from '../types';

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
import { configureI18n } from '../utils/translations';

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

export const getCommandBindings = async (call: AppCallRequest): Promise<AppsState> => {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const actingUser: AppActingUser | undefined = call.context.acting_user;
    const context = call.context as AppContext;

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
        commands.push(Commands.SUBSCRIPTION);
        commands.push(Commands.ALERT);
        commands.push(Commands.LIST);
        bindings.push(subscriptionBinding());
        bindings.push(alertBinding());
        bindings.push(getAllBinding());
    }

    return newCommandBindings(context, bindings, commands);
};

