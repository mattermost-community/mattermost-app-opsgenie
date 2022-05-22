const PathsVariable = {
    Identifier: ':IDENTIFIER'
}

const AppPaths = {
    ManifestPath: '/manifest.json',
    BindingsPath: '/bindings',
    InstallPath: '/install',
    BindingPathHelp: '/help',

    CallPathAlertCreate: '/alert/create',
    CallPathAlertClose: '/alert/close',
    CallPathAlertUnacknowledge: '/alert/unacknowledge',
    CallPathAlertAcknowledged: '/alert/Acknowledged',
    CallPathAlertOtherActions: '/alert/otheractions',
    CallPathCloseOptions: '/alert/closeoptions',

    CallPathNoteToAlertModal: '/alert/note',
    CallPathSnoozeAlertCreate: '/alert/snooze/create',
    CallPathAssignOwnerAlert: '/alert/assign',
    CallPathAlertSubmitOrUpdate: '/alert/submit-or-update',

    SubscribeIncomingWebhookPath: '/webhook'
}

const OpsGeniePaths = {
    AlertPathPrefix: '/alerts',
    CloseAlertPathPrefix: `/alerts/${PathsVariable.Identifier}/close`,
    UnacknowledgeAlertPathPrefix: `/alerts/${PathsVariable.Identifier}/unacknowledge`,
    AcknowledgeAlertPathPrefix: `/alerts/${PathsVariable.Identifier}/acknowledge`,
    TeamPathPrefix: '/teams',
    APIVersionV2: '/v2',
};

const MattermostPaths = {
    PostsPath: '/posts',
    PostPath: `/posts/${PathsVariable.Identifier}`,
    DialogsOpenPath: '/actions/dialogs/open',
    ApiVersionV4: '/api/v4'
}

export const Routes = {
    PathsVariable,
    App: AppPaths,
    Mattermost: MattermostPaths,
    OpsGenie: OpsGeniePaths
};
