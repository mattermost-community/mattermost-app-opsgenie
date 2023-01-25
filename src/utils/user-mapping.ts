import { AppExpandLevels } from '../constant';
import { AppCallAction, AppCallRequest, Oauth2App } from '../types';

export const ExtendRequired = {
    acting_user: AppExpandLevels.EXPAND_ALL,
    acting_user_access_token: AppExpandLevels.EXPAND_ALL,
    oauth2_app: AppExpandLevels.EXPAND_ALL,
    locale: AppExpandLevels.EXPAND_ALL,
};

export function getOpsGenieAPIKey(call: AppCallRequest | AppCallAction<any>): string {
    const oauth2: Oauth2App = call.context.oauth2 as Oauth2App;
    return oauth2.client_id;
}