import { AppCallAction, AppContext, AppContextAction, AppForm } from './apps';
import { WebhookRequest } from './opsgenie';

export type WebhookFunction = (webhookRequest: WebhookRequest<any>, context: AppContext) => Promise<void>;

export type OtherActionsFunction = (call: AppCallAction<AppContextAction>) => Promise<AppForm | void>