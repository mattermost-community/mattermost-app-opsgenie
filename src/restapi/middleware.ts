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
        res.json(showMessageToMattermost(new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.not-provided'))));
        return;
    }

    if (!isUserSystemAdmin(actingUser)) {
        res.json(showMessageToMattermost(new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.system-admin'))));
        return;
    }

    next();
};

export const requireOpsGenieAPIKey = (req: Request, res: Response, next: () => void) => {
    const call: AppCallRequest = req.body as AppCallRequest;
    const oauth2: Oauth2App = call.context.oauth2 as Oauth2App;
    const i18nObj = configureI18n(call.context);

    if (!existsOpsGenieAPIKey(oauth2)) {
        res.json(showMessageToMattermost(new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.api-key-not-found'))));
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
        res.json(showMessageToMattermost(new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.not-provided'))));
        return;
    }

    if (linkEmailAddress(oauth2)) {
        next();
        return;
    }

    if (!isUserSystemAdmin(actingUser)) {
        res.json(showMessageToMattermost(new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('general.validation-user.system-admin'))));
        return;
    }

    next();
};