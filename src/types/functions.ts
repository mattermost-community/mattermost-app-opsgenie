import { AppCallAction, AppContext, AppContextAction, AppForm, WebhookAppCallRequest } from './apps';

export type WebhookFunction = (webhookRequest: WebhookAppCallRequest<any>) => Promise<void>;

export type OtherActionsFunction = (call: AppCallAction<AppContextAction>) => Promise<AppForm | string | void>