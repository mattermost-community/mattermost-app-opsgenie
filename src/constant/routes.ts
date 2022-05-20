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


    CallPathNoteToAlertModal: '/alert/note',
    CallPathSnoozeAlertCreate: '/alert/snooze/create',
    CallPathAssignOwnerAlert: '/alert/assign',
    CallPathAlertSubmitOrUpdate: '/alert/submit-or-update',

    SubscribeIncomingWebhookPath: '/webhook'
}

const OpsGeniePaths = {
    AlertPathPrefix: '/alerts',
    CloseAlertPathPrefix: '/alerts/:IDENTIFIER/close',
    UnacknowledgeAlertPathPrefix: '/alerts/:IDENTIFIER/unacknowledge',
    AcknowledgeAlertPathPrefix: '/alerts/:IDENTIFIER/acknowledge',
    TeamPathPrefix: '/teams',
    APIVersionV2: '/v2',
};

const MattermostPaths = {
    PostsPath: '/posts',
    DialogsOpenPath: '/actions/dialogs/open',
    ApiVersionV4: '/api/v4'
}

export const Routes = {
    App: AppPaths,
    Mattermost: MattermostPaths,
    OpsGenie: OpsGeniePaths
};
