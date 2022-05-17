import {AppBinding} from '../types';
import {AppExpandLevels, Locations, OpsGenieIcon, Routes, Commands} from '../constant';

export const getHelpBinding = (): any => {
    return {
        label: Commands.HELP,
        description: 'Show OpsGenie Help',
        form: {
            title: "Show OpsGenie Help Title",
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.BindingPathHelp,
                expand: {
                    acting_user_access_token: AppExpandLevels.EXPAND_ALL
                }
            }
        }
    };
};

export const createAlertBinding = (): any => {
    return {
        label: Commands.ALERT,
        description: 'Create Alert in OpsGenie',
        form: {
            title: "Show OpsGenie Help Title",
            icon: OpsGenieIcon,
            submit: {
                path: Routes.App.CallPathAlertCreate,
                expand: {
                    acting_user_access_token: AppExpandLevels.EXPAND_ALL
                }
            }
        }
    }
}

