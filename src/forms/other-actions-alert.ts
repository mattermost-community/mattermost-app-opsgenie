import {
    AppCallAction,
    AppContextAction,
    AppForm,
} from '../types';
import {
    ActionsEvents,
    AppFieldSubTypes,
    AppFieldTypes,
    ExceptionType,
    NoteModalForm,
    OpsGenieIcon,
    Routes,
    option_alert_add_note,
    option_alert_assign,
    option_alert_snooze,
    option_alert_take_ownership,
    options_alert_time,
} from '../constant';
import { configureI18n } from '../utils/translations';
import { OtherActionsFunction } from '../types/functions';

import { ExtendRequired } from '../utils/user-mapping';

import { Exception } from '../utils/exception';
import { AppFormFieldValidator, AppFormValidator } from '../utils/validator';

import { takeOwnershipAlertCall } from './take-ownership-alert';

async function showModalNoteToAlert(call: AppCallAction<AppContextAction>): Promise<AppForm> {
    const i18nObj = configureI18n(call.context);
    const fieldsObject = AppFormFieldValidator.parse({
        type: AppFieldTypes.TEXT,
        subtype: AppFieldSubTypes.TEXTAREA,
        name: NoteModalForm.NOTE_MESSAGE,
        modal_label: i18nObj.__('forms.actions.display-note'),
        is_required: true,
        max_length: 250,
    });

    const form: AppForm = {
        title: i18nObj.__('forms.actions.title-note', { alert: call.state.alert.tinyId }),
        icon: OpsGenieIcon,
        fields: [
            fieldsObject,
        ],
        submit: {
            path: Routes.App.CallPathNoteToAlertAction,
            expand: {
                ...ExtendRequired,
            },
            state: call.state,
        },
    };

    if (!AppFormValidator.safeParse(form).success) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.error-validation-form'), call.context.mattermost_site_url, call.context.app_path);
    }

    return form;
}

async function showPostOfListUsers(call: AppCallAction<AppContextAction>): Promise<AppForm> {
    const i18nObj = configureI18n(call.context);
    const fieldsObject = AppFormFieldValidator.parse({
        type: AppFieldTypes.USER,
        name: ActionsEvents.USER_SELECT_EVENT,
        modal_label: i18nObj.__('forms.actions.name-list-user'),
        is_required: true,
        position: 2,
    });

    const form: AppForm = {
        title: i18nObj.__('forms.actions.title-list-user'),
        icon: OpsGenieIcon,
        fields: [
            fieldsObject,
        ],
        submit: {
            path: Routes.App.CallPathAssignAlertAction,
            expand: {
                ...ExtendRequired,
            },
            state: call.state,
        },
    };

    if (!AppFormValidator.safeParse(form).success) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.error-validation-form'), call.context.mattermost_site_url, call.context.app_path);
    }

    return form;
}

async function showPostOfTimes(call: AppCallAction<AppContextAction>): Promise<AppForm> {
    const i18nObj = configureI18n(call.context);
    const fieldsObject = AppFormFieldValidator.parse({
        type: AppFieldTypes.STATIC_SELECT,
        name: ActionsEvents.TIME_SELECT_EVENT,
        modal_label: i18nObj.__('forms.actions.name-snooze'),
        is_required: true,
        options: options_alert_time,
    });

    const form: AppForm = {
        title: i18nObj.__('forms.actions.title-snooze'),
        icon: OpsGenieIcon,
        fields: [
            fieldsObject,
        ],
        submit: {
            path: Routes.App.CallPathSnoozeAlertAction,
            expand: {
                ...ExtendRequired,
            },
            state: call.state,
        },
    };
    if (!AppFormValidator.safeParse(form).success) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.error-validation-form'), call.context.mattermost_site_url, call.context.app_path);
    }

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
