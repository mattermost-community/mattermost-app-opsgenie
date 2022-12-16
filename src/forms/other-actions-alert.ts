import {
    Alert,
    AlertAssign,
    AppCallAction,
    AppCallValues,
    AppContextAction,
    AppForm,
    Identifier,
    IdentifierType,
    ResponseResultWithData,
    User,
} from '../types';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';
import {
    ActionsEvents,
    AppExpandLevels,
    AppFieldSubTypes,
    AppFieldTypes,
    ExceptionType,
    NoteModalForm,
    OpsGenieIcon,
    Routes,
    StoreKeys,
    option_alert_add_note,
    option_alert_assign,
    option_alert_snooze,
    option_alert_take_ownership,
    options_alert_time,
    AckAlertForm,
} from '../constant';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { configureI18n } from '../utils/translations';
import { getAlertLink, tryPromise } from '../utils/utils';
import { ConfigStoreProps, KVStoreClient, KVStoreOptions } from '../clients/kvstore';
import { Exception } from '../utils/exception';
import { OtherActionsFunction } from '../types/functions';
import { takeOwnershipAlertCall } from './take-ownership-alert';

async function showModalNoteToAlert(call: AppCallAction<AppContextAction>): Promise<AppForm> {
    const i18nObj = configureI18n(call.context);

    const form: AppForm = {
        title: i18nObj.__('forms.actions.title-note', { alert: call.state.alert.tinyId }),
        icon: OpsGenieIcon,
        fields: [
            {
                type: AppFieldTypes.TEXT,
                subtype: AppFieldSubTypes.TEXTAREA,
                name: NoteModalForm.NOTE_MESSAGE,
                modal_label: i18nObj.__('forms.actions.display-note'),
                is_required: true,
                max_length: 250,
            },
        ],
        submit: {
            path: Routes.App.CallPathNoteToAlertAction,
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                acting_user_access_token: AppExpandLevels.EXPAND_SUMMARY,
                locale: AppExpandLevels.EXPAND_ALL,
            },
            state: call.state,
        },
    };
    return form;
}

async function showPostOfListUsers(call: AppCallAction<AppContextAction>): Promise<AppForm> {
    const i18nObj = configureI18n(call.context);

    const form: AppForm = {
        title: i18nObj.__('forms.actions.title-list-user'),
        icon: OpsGenieIcon,
        fields: [
            {
                type: AppFieldTypes.USER,
                name: ActionsEvents.USER_SELECT_EVENT,
                modal_label: i18nObj.__('forms.actions.name-list-user'),
                is_required: true,
                position: 2,
            },
        ],
        submit: {
            path: Routes.App.CallPathAssignAlertAction,
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                acting_user_access_token: AppExpandLevels.EXPAND_SUMMARY,
                locale: AppExpandLevels.EXPAND_ALL,
            },
            state: call.state,
        },
    };
    return form;
}

async function showPostOfTimes(call: AppCallAction<AppContextAction>): Promise<AppForm> {
    const i18nObj = configureI18n(call.context);

    const form: AppForm = {
        title: i18nObj.__('forms.actions.title-snooze'),
        icon: OpsGenieIcon,
        fields: [
            {
                type: AppFieldTypes.STATIC_SELECT,
                name: ActionsEvents.TIME_SELECT_EVENT,
                modal_label: i18nObj.__('forms.actions.name-snooze'),
                is_required: true,
                options: options_alert_time,
            },
        ],
        submit: {
            path: Routes.App.CallPathSnoozeAlertAction,
            expand: {
                acting_user: AppExpandLevels.EXPAND_SUMMARY,
                acting_user_access_token: AppExpandLevels.EXPAND_SUMMARY,
                locale: AppExpandLevels.EXPAND_ALL,
            },
            state: call.state,
        },
    };
    return form;
}

const ACTIONS_EVENT: { [key: string]: OtherActionsFunction } = {
    [option_alert_assign]: showPostOfListUsers,
    [option_alert_add_note]: showModalNoteToAlert,
    [option_alert_take_ownership]: takeOwnershipAlertCall,
    [option_alert_snooze]: showPostOfTimes,
};

export async function otherActionsAlertCall(call: AppCallAction<AppContextAction>): Promise<AppForm | string | void | null> {
    const selectedOption: string = call.state.action;

    const handle: OtherActionsFunction = ACTIONS_EVENT[selectedOption];
    if (handle && typeof handle === 'function') {
        return handle(call);
    }
    return null;
}
