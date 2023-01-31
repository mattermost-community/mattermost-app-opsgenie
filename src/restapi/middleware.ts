import { Request, Response } from 'express';

import { allowMemberAction, linkEmailAddress } from '../utils/user-mapping';

import { ExceptionType } from '../constant';
import { AppActingUser, AppCallRequest, Oauth2App } from '../types';
import { Exception } from '../utils/exception';
import { configureI18n } from '../utils/translations';
import { existsOpsGenieAPIKey, isUserSystemAdmin, showMessageToMattermost } from '../utils/utils';

export const requireSystemAdmin = (req: Request, res: Response, next: () => void) => {
    const call: AppCallRequest = req.body as AppCallRequest;
    const i18nObj = configureI18n(call.context);
    const actingUser: AppActingUser = call.context.acting_user as AppActingUser;

    if (!actingUser) {
        res.json(showMessageToMattermost(new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.not-provided'), call.context.mattermost_site_url, call.context.app_path)));
        return;
    }

    if (!isUserSystemAdmin(actingUser)) {
        res.json(showMessageToMattermost(new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.system-admin'), call.context.mattermost_site_url, call.context.app_path)));
        return;
    }

    next();
};

export const requireOpsGenieAPIKey = (req: Request, res: Response, next: () => void) => {
    const call: AppCallRequest = req.body;
    const oauth2: Oauth2App | undefined = call.context.oauth2;
    const i18nObj = configureI18n(call.context);

    if (!oauth2) {
        throw new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.oauth2-not-found'), call.context.mattermost_site_url, call.context.app_path);
    }

    if (!existsOpsGenieAPIKey(oauth2)) {
        res.json(showMessageToMattermost(new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.api-key-not-found'), call.context.mattermost_site_url, call.context.app_path)));
        return;
    }

    next();
};

export const requireOpsGenieAllowUserMapping = (req: Request, res: Response, next: () => void) => {
    const call: AppCallRequest = req.body as AppCallRequest;
    const oauth2: Oauth2App = call.context.oauth2 as Oauth2App;
    const i18nObj = configureI18n(call.context);
    const actingUser: AppActingUser = call.context.acting_user as AppActingUser;

    if (!actingUser) {
        res.json(showMessageToMattermost(new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.not-provided'), call.context.mattermost_site_url, call.context.app_path)));
        return;
    }

    if (linkEmailAddress(oauth2)) {
        next();
        return;
    }

    if (!isUserSystemAdmin(actingUser)) {
        res.json(showMessageToMattermost(new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.system-admin'), call.context.mattermost_site_url, call.context.app_path)));
        return;
    }

    next();
};