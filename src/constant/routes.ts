const PathsVariable = {
    Identifier: ':IDENTIFIER',
    Account: ':ACCOUNT',
};

export const AppsPluginName = 'com.mattermost.apps';
export const AppsOpsGenie = `https://${PathsVariable.Account}.app.opsgenie.com`;

const AppPaths = {
    ManifestPath: '/manifest.json',
    BindingsPath: '/bindings',
    InstallPath: '/install',

    CallPathHelp: '/help',
    CallPathConfigForm: '/config/form',
    CallPathConfigSubmit: '/config/form/submit',

    CallPathSettingsForm: '/settings/form',
    CallPathSettingsSubmit: '/settings/form/submit',

    CallPathConnectSubmit: '/connect/login/submit',
    OAuthCompletePath: '/oauth2/complete',
    OAuthConnectPath: '/oauth2/connect',

    CallPathSubscriptionAddForm: '/subscription/add/form',
    CallPathSubscriptionAddSubmit: '/subscription/add/submit',
    CallPathSubscriptionDeleteForm: '/subscription/delete/form',
    CallPathSubscriptionDeleteSubmit: '/subscription/delete/submit',
    CallPathSubscriptionListSubmit: '/subscription/list/submit',

    CallPathTeamsListSubmit: '/team/list',
    CallPathAlertsListSubmit: '/alert/list',

    CallPathAlertCreate: '/alert/create',

    CallPathAlertCloseSubmit: '/alert/close/submit',
    CallPathAlertCloseAction: '/alert/close/action',

    CallPathAlertUnacknowledge: '/alert/unacknowledge',
    CallPathAlertUnacknowledgeAction: '/alert/unacknowledge/action',

    CallPathAlertAcknowledgedSubmit: '/alert/acknowledged',
    CallPathAlertAcknowledgedAction: '/alert/acknowledged/action',

    CallPathAlertOtherActions: '/alert/otheractions',

    CallPathAssignAlertSubmit: '/alert/assign',
    CallPathAssignAlertAction: '/alert/assign/action',

    CallPathUpdatePriorityAlertSubmit: '/alert/priority',
    CallPathSnoozeAlert: '/alert/snooze',
    CallPathSnoozeAlertAction: '/alert/snooze/action',

    CallPathNoteToAlertSubmit: '/alert/note',
    CallPathNoteToAlertAction: '/alert/note/action',

    CallPathTakeOwnershipAlertSubmit: '/alert/takeownership',

    CallPathIncomingWebhookPath: '/webhook',
};

const OpsGenieWebPaths = {
    AlertDetailPathPrefix: `/alert/detail/${PathsVariable.Identifier}`,
};

const OpsGeniePaths = {
    IntegrationPathPrefix: '/integrations',
    DeleteIntegrationPathPrefix: `/integrations/${PathsVariable.Identifier}`,
    GetIntegrationPathPrefix: `/integrations/${PathsVariable.Identifier}`,
    AccountPathPrefix: '/account',
    AlertPathPrefix: '/alerts',
    NoteToAlertPathPrefix: `/alerts/${PathsVariable.Identifier}/notes`,
    UpdatePriorityToAlertPathPrefix: `/alerts/${PathsVariable.Identifier}/priority`,
    CloseAlertPathPrefix: `/alerts/${PathsVariable.Identifier}/close`,
    UnacknowledgeAlertPathPrefix: `/alerts/${PathsVariable.Identifier}/unacknowledge`,
    AcknowledgeAlertPathPrefix: `/alerts/${PathsVariable.Identifier}/acknowledge`,
    AssignAlertPathPrefix: `/alerts/${PathsVariable.Identifier}/assign`,
    SnoozeAlertPathPrefix: `/alerts/${PathsVariable.Identifier}/snooze`,
    UserPathPrefix: `/users/${PathsVariable.Identifier}`,
    TeamPathPrefix: '/teams',
    APIVersionV2: '/v2',
    APIVersionV1: '/v1',
};

const MattermostPaths = {
    PathKV: '/kv',
    PathOAuth2App: '/oauth2/app',
    PathOAuth2User: '/oauth2/user',
    UsersUpdateRolePath: `/users/${PathsVariable.Identifier}/roles`,
    PostsPath: '/posts',
    PostsEphemeralPath: '/posts/ephemeral',
    PostPath: `/posts/${PathsVariable.Identifier}`,
    UserPath: `/users/${PathsVariable.Identifier}`,
    ChannelPath: `/channels/${PathsVariable.Identifier}`,
    ChannelMemberPath: `/channels/${PathsVariable.Identifier}/members`,
    TeamMemberPath: `/teams/${PathsVariable.Identifier}/members`,
    ApiVersionV4: '/api/v4',
    ApiVersionV1: '/api/v1',
};

export const Routes = {
    PathsVariable,
    App: AppPaths,
    Mattermost: MattermostPaths,
    OpsGenie: OpsGeniePaths,
    OpsGenieWeb: OpsGenieWebPaths,
};
