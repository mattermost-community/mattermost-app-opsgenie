import {AppBinding} from '../types';
import {
    AppExpandLevels,
    OpsGenieIcon,
    Routes,
    Commands
} from '../constant';

export const getHelpBinding = (): any => {
    return {
        label: Commands.HELP,
        icon: OpsGenieIcon,
        description: 'Show OpsGenie Help',
        form: {
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathHelp,
                expand: {}
            }
        }
    };
};

export const getConfigureBinding = (): any => {
    return {
        icon: OpsGenieIcon,
        label: Commands.CONFIGURE,
        description: 'Setup Opsgenie Admin Account',
        form: {
            title: "Show Trello Help Title",
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathConfigForm,
                expand: {
                    acting_user: AppExpandLevels.EXPAND_SUMMARY,
                    acting_user_access_token: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_app: AppExpandLevels.EXPAND_SUMMARY,
                    oauth2_user: AppExpandLevels.EXPAND_SUMMARY,
                }
            }
        }
    }
};

export const createAlertBinding = (): AppBinding => {
    return {
        label: Commands.ALERT,
        icon: OpsGenieIcon,
        description: 'Create Alert in OpsGenie',
        form: {
            title: "Alert create",
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathAlertCreate,
                expand: { }
            },
            fields: [
                {
                    name: 'message',
                    type: 'text',
                    is_required: true,
                    position: 1
                }
            ]
        }
    }
}
