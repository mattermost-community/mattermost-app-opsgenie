import { AppCallRequest, Oauth2App } from "../types";

export function getOpsGenieAPIKey(call: AppCallRequest): string {
   const oauth2: Oauth2App = call.context.oauth2 as Oauth2App;
   return oauth2.client_id;
}