import { AppCallAction, AppContextAction, AppForm } from './apps';
import { WebhookAppCallRequestType } from './opsgenie';

export type WebhookFunction<T> = (webhookRequest: WebhookAppCallRequestType) => Promise<void>;

export type OtherActionsFunction = (call: AppCallAction<AppContextAction>) => Promise<AppForm | string | void>