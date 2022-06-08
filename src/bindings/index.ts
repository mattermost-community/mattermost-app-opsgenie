import {AppsState, BindingOptions} from '../types';
import {getCommandBindings} from './slash_commands';
import {isConfigured, isConnected, isUserSystemAdmin} from '../utils/utils';

export function getAppBindings(context: any): AppsState[] {
    const bindingOptions: BindingOptions = {
        isSystemAdmin: isUserSystemAdmin(context.acting_user),
        isConfigured: isConfigured(context.oauth2),
        isConnected: isConnected(context.oauth2.user),
        opsGenieUserRole: context.oauth2.user?.role,
        mattermostSiteUrl: context.mattermost_site_url,
    };

    const bindings: AppsState[] = [];
    bindings.push(getCommandBindings(bindingOptions));

    return bindings;
}
