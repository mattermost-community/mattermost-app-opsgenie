import queryString, {ParsedQuery, ParsedUrl} from 'query-string';
import {
    AppCallRequest,
    AppCallValues,
    Identifier,
    IdentifierType,
    Integration,
    IntegrationCreate,
    Integrations,
    IntegrationType,
    ListIntegrationsParams,
    ResponseResultWithData,
    Team
} from '../types';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {ExceptionType, Routes, StoreKeys, SubscriptionCreateForm} from '../constant';
import {OpsGenieClient, OpsGenieOptions} from "../clients/opsgenie";
import {tryPromise} from "../utils/utils";
import {Exception} from "../utils/exception";

export async function subscriptionAddCall(call: AppCallRequest): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const appPath: string | undefined = call.context.app_path;
    const whSecret: string | undefined = call.context.app?.webhook_secret;
    const values: AppCallValues | undefined  = call.values;

    const teamName: string = values?.[SubscriptionCreateForm.TEAM_NAME];
    const channelId: string = values?.[SubscriptionCreateForm.CHANNEL_ID].value;
    const channelName: string = values?.[SubscriptionCreateForm.CHANNEL_ID].label;

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const kvStore: KVStoreClient = new KVStoreClient(options);

    const configStore: ConfigStoreProps = await kvStore.kvGet(StoreKeys.config);
    const whPath = Routes.App.CallPathIncomingWebhookPath;

    const params: string = queryString.stringify({
        secret: whSecret,
        channelId
    });
    const url: string = `${mattermostUrl}${appPath}${whPath}?${params}`;

    const optionsOps: OpsGenieOptions = {
        api_key: configStore.opsgenie_apikey
    };
    const opsGenieClient: OpsGenieClient = new OpsGenieClient(optionsOps);

    const identifier: Identifier = {
        identifier: teamName,
        identifierType: IdentifierType.NAME
    };
    const responseTeam: ResponseResultWithData<Team> = await tryPromise(opsGenieClient.getTeam(identifier), ExceptionType.MARKDOWN, 'OpsGenie failed');
    const team: Team = responseTeam.data;

    const paramsIntegrations: ListIntegrationsParams = {
        type: IntegrationType.WEBHOOK,
        teamId: team.id,
        teamName: team.name
    };
    const responseIntegrations: ResponseResultWithData<Integrations[]> = await tryPromise(opsGenieClient.listIntegrations(paramsIntegrations), ExceptionType.MARKDOWN, 'OpsGenie failed');
    const integrations: Integrations[] = responseIntegrations.data;

    for (const integration of integrations) {
        const responseIntegration: ResponseResultWithData<Integration> = await tryPromise(opsGenieClient.getIntegration(integration.id), ExceptionType.MARKDOWN, 'OpsGenie failed');
        const auxIntegration: Integration = responseIntegration.data;
        const queryParams: ParsedUrl = queryString.parseUrl(auxIntegration.url);
        const params: ParsedQuery = queryParams.query;

        if (<string>params['channelId'] === channelId) {
            throw new Exception(ExceptionType.MARKDOWN, `team [${team.name}] is already associated with channel [${channelName}]`);
        }
    }

    const data: IntegrationCreate = {
        name: `Mattermost_${channelName}_${team.name}`,
        type: IntegrationType.WEBHOOK,
        ownerTeam: {
            id: team.id
        },
        allowReadAccess: false,
        allowWriteAccess: false,
        allowConfigurationAccess: true,
        url
    };
    
    await tryPromise(opsGenieClient.createIntegration(data), ExceptionType.MARKDOWN, 'OpsGenie failed');
}
