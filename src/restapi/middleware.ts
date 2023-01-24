import { Request, Response } from 'express';
import { ExceptionType } from "../constant";
import { AppCallRequest, AppActingUser } from "../types";
import { Exception } from "../utils/exception";
import { configureI18n } from "../utils/translations";
import { showMessageToMattermost, isUserSystemAdmin } from "../utils/utils";


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