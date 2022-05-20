const AppPaths = {
    ManifestPath: '/manifest.json',
    BindingsPath: '/bindings',
    InstallPath: '/install',

    CallPathAlertCreate: '/alert/create',
    CallPathAlertClose: '/alert/close',
    CallPathNoteToAlertModal: '/alert/note/modal',
    CallPathSnoozeAlertCreate: '/alert/snooze/create',
    CallPathAssignOwnerAlert: '/alert/assign',
    CallPathAlertSubmitOrUpdate: '/alert/submit-or-update',
    BindingPathHelp: '/help',

    SubscribeIncomingWebhookPath: '/webhook'
}

const OpsGeniePaths = {
    AlertPathPrefix: '/alerts',
    CloseAlertPathPrefix: '/alerts/:IDENTIFIER/close',
    TeamPathPrefix: '/teams',
    APIVersionV2: '/v2',
};

const MattermostPaths = {
    PostsPath: '/posts',
    ApiVersionV4: '/api/v4'
}

export const Routes = {
    App: AppPaths,
    Mattermost: MattermostPaths,
    OpsGenie: OpsGeniePaths
};
