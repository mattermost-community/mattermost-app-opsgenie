import queryString, { ParsedQuery, ParsedUrl } from 'query-string';

import {
    ActionResponse,
    AppCallRequest,
    AppCallValues,
    AppForm,
    AppFormValue,
    AppSelectOption,
    Channel,
    Identifier,
    IdentifierType,
    Integration,
    IntegrationCreate,
    IntegrationType,
    Integrations,
    ListIntegrationsParams,
    Team,
} from '../types';
import { AppExpandLevels, AppFieldTypes, ExceptionType, OpsGenieIcon, Routes, SubscriptionCreateForm } from '../constant';
import { OpsGenieClient, OpsGenieOptions } from '../clients/opsgenie';
import { configureI18n } from '../utils/translations';
import { tryPromise } from '../utils/utils';
import { Exception } from '../utils/exception';

import { ExtendRequired, getOpsGenieAPIKey } from '../utils/user-mapping';

import { MattermostClient, MattermostOptions } from '../clients/mattermost';

import { AppFormValidator } from '../utils/validator';

import { getAllTeamsCall } from './list-team';

export async function subscriptionAddCall(call: AppCallRequest): Promise<string> {
    const accessToken: string | undefined = call.context.acting_user_access_token;
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const whSecret: string | undefined = call.context.app?.webhook_secret;
    const botUserID: string = call.context.bot_user_id!;
    const appPath: string | undefined = call.context.app_path;
    const values: AppCallValues | undefined = call.values;
    const i18nObj = configureI18n(call.context);
    const apiKey = getOpsGenieAPIKey(call);

    if (!values) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('general.validation-form.values-not-found'), call.context.mattermost_site_url, call.context.app_path);
    }

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
        api_key: apiKey,
    };
    const opsGenieClient: OpsGenieClient = new OpsGenieClient(optionsOps);

    const identifier: Identifier = {
        identifier: teamId,
        identifierType: IdentifierType.ID,
    };
    const team: Team = await tryPromise<Team>(opsGenieClient.getTeam(identifier), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);

    const paramsIntegrations: ListIntegrationsParams = {
        type: IntegrationType.WEBHOOK,
        teamId: team.id,
        teamName: team.name,
    };
    const integrations: Integrations[] = await tryPromise<Integrations[]>(opsGenieClient.listIntegrations(paramsIntegrations), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);

    for (const integration of integrations) {
        const auxIntegration: Integration = await tryPromise<Integration>(opsGenieClient.getIntegration(integration.id), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path); // eslint-disable-line no-await-in-loop
        const parsedQuery: ParsedUrl = queryString.parseUrl(auxIntegration.url);
        const queryParams: ParsedQuery = parsedQuery.query;

        if (queryParams.channelId === channelId) {
            throw new Exception(ExceptionType.TEXT_ERROR, i18nObj.__('forms.subcription-add.exception', { name: team.name, channelName }), call.context.mattermost_site_url, call.context.app_path);
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

    await tryPromise<ActionResponse>(opsGenieClient.createIntegration(data), ExceptionType.MARKDOWN, i18nObj.__('forms.error'), call.context.mattermost_site_url, call.context.app_path);

    const mattermostOption: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>accessToken,
    };

    const mattermostClient: MattermostClient = new MattermostClient(mattermostOption);
    const channel: Channel = await mattermostClient.getChannel(channelId);

    await mattermostClient.addUserToTeam(channel.team_id, botUserID);
    await mattermostClient.addMemberToChannel(channelId, botUserID);

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
                app: AppExpandLevels.EXPAND_ALL,
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

    if (!AppFormValidator.safeParse(form).success) {
        throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('forms.error-validation-form'), call.context.mattermost_site_url, call.context.app_path);
    }

    return form;
}
