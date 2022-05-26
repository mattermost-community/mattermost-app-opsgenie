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
            title: "Show OpsGenie Help Title",
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathHelp,
                expand: {}
            }
        }
    };
};

export const createAlertBinding = (): AppBinding => {
    return {
        label: Commands.ALERT,
        icon: OpsGenieIcon,
        description: 'Create Alert in OpsGenie',
        form: {
            title: "Show OpsGenie Help Title",
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathAlertCreate,
                expand: {
                    channel: AppExpandLevels.EXPAND_ALL
                }
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
                expand: {}
            }
        }
    }
};

