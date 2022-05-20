const AppPaths = {
    ManifestPath: '/manifest.json',
    BindingsPath: '/bindings',
    InstallPath: '/install',

    CallPathAlertCreate: '/alert/create',
    CallPathNoteToAlertModal: '/alert/note/modal',
    CallPathSnoozeAlertCreate: '/alert/snooze/create',
    CallPathAssignOwnerAlert: '/alert/assign',
    CallPathAlertSubmitOrUpdate: '/alert/submit-or-update',
    BindingPathHelp: '/help',

    SubscribeIncomingWebhookPath: '/webhook/webhook-target'
}

const OpsGeniePaths = {
    AlertPathPrefix: '/alerts',
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
