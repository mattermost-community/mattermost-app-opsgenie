import queryString, { ParsedQuery, ParsedUrl } from 'query-string';

import {
    AppCallRequest,
    AppCallValues,
    AppForm,
    AppFormValue,
    AppSelectOption,
    Identifier,
    IdentifierType,
    Integration,
    IntegrationCreate,
    IntegrationType,
    Integrations,
    ListIntegrationsParams,
    ResponseResultWithData,
    Team,
} from '../types';
import { AppExpandLevels, AppFieldTypes, ExceptionType, OpsGenieIcon, Routes, SubscriptionCreateForm } from '../constant';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { configureI18n } from '../utils/translations';
import { tryPromise } from '../utils/utils';
import { Exception } from '../utils/exception';

import { getAllTeamsCall } from './list-team';
import { ExtendRequired, getOpsGenieAPIKey } from '../utils/user-mapping';

export async function subscriptionAddCall(call: AppCallRequest): Promise<string> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const appPath: string | undefined = call.context.app_path;
    const whSecret: string | undefined = call.context.app?.webhook_secret;
    const values: AppCallValues | undefined = call.values;
    const i18nObj = configureI18n(call.context);
    const apiKey = getOpsGenieAPIKey(call);

    const teamId: string = values?.[SubscriptionCreateForm.TEAM_NAME].value;
    const channelId: string = values?.[SubscriptionCreateForm.CHANNEL_ID].value;
    const channelName: string = values?.[SubscriptionCreateForm.CHANNEL_ID].label;

    const whPath = Routes.App.CallPathIncomingWebhookPath;

    const params: string = queryString.stringify({
        secret: whSecret,
        channelId,
    });
    const url = `${mattermostUrl}${appPath}${whPath}?${params}`;

    const optionsOps: OpsGenieOptions = {
        api_key: apiKey
    };
    const opsGenieClient: OpsGenieClient = new OpsGenieClient(optionsOps);

    const identifier: Identifier = {
        identifier: teamId,
        identifierType: IdentifierType.ID,
    };
    const responseTeam: ResponseResultWithData<Team> = await tryPromise(opsGenieClient.getTeam(identifier), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
    const team: Team = responseTeam.data;

    const paramsIntegrations: ListIntegrationsParams = {
        type: IntegrationType.WEBHOOK,
        teamId: team.id,
        teamName: team.name,
    };
    const responseIntegrations: ResponseResultWithData<Integrations[]> = await tryPromise(opsGenieClient.listIntegrations(paramsIntegrations), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
    const integrations: Integrations[] = responseIntegrations.data;

    for (const integration of integrations) {
        const responseIntegration: ResponseResultWithData<Integration> = await tryPromise(opsGenieClient.getIntegration(integration.id), ExceptionType.MARKDOWN, i18nObj.__('forms.error')); // eslint-disable-line no-await-in-loop
        const auxIntegration: Integration = responseIntegration.data;
        const parsedQuery: ParsedUrl = queryString.parseUrl(auxIntegration.url);
        const queryParams: ParsedQuery = parsedQuery.query;

        if (queryParams.channelId === channelId) {
            throw new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('forms.subcription-add.exception', { name: team.name, channelName }));
        }
    }

    const data: IntegrationCreate = {
        name: `Mattermost_${channelName}_${team.name}`,
        type: IntegrationType.WEBHOOK,
        ownerTeam: {
            id: team.id,
        },
        allowReadAccess: false,
        allowWriteAccess: false,
        allowConfigurationAccess: true,
        url,
    };

    await tryPromise(opsGenieClient.createIntegration(data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'));
    return i18nObj.__('api.subcription.message-created');
}

export async function subscriptionAddFormCall(call: AppCallRequest): Promise<AppForm> {
    const i18nObj = configureI18n(call.context);
    const currChannel = call.context.channel;
    const channelOption: AppFormValue = {
        label: <string>currChannel?.name,
        value: <string>currChannel?.id,
    };

    const teams = await getAllTeamsCall(call);
    const teamOptions: AppSelectOption[] = teams.map((team) => {
        return {
            label: team.name,
            value: team.id,
        } as AppSelectOption;
    });

    const form: AppForm = {
        title: i18nObj.__('binding.binding.command-add-title'),
        icon: OpsGenieIcon,
        submit: {
            path: Routes.App.CallPathSubscriptionAddSubmit,
            expand: {
                ...ExtendRequired,
                app: AppExpandLevels.EXPAND_ALL
            },
        },
        fields: [
            {
                modal_label: i18nObj.__('binding.binding.name-team'),
                name: SubscriptionCreateForm.TEAM_NAME,
                type: AppFieldTypes.STATIC_SELECT,
                is_required: true,
                position: 1,
                options: teamOptions,
            },
            {
                modal_label: i18nObj.__('binding.binding.name-channel'),
                name: SubscriptionCreateForm.CHANNEL_ID,
                type: AppFieldTypes.CHANNEL,
                is_required: true,
                position: 2,
                value: channelOption,
            },
        ],
    };

    return form;
}
