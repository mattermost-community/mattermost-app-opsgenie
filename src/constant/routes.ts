export const AppsPluginName = 'com.mattermost.apps';

const PathsVariable = {
    Identifier: ':IDENTIFIER'
}

const AppPaths = {
    ManifestPath: '/manifest.json',
    BindingsPath: '/bindings',
    InstallPath: '/install',

    CallPathHelp: '/help',
    CallPathConfigForm: '/config/form',
    CallPathConfigSubmit: '/config/form/submit',

    CallPathAlertCreate: '/alert/create',
    CallPathAlertClose: '/alert/close',
    CallPathAlertUnacknowledge: '/alert/unacknowledge',
    CallPathAlertAcknowledged: '/alert/Acknowledged',
    CallPathAlertOtherActions: '/alert/otheractions',
    CallPathCloseOptions: '/alert/closeoptions',
    CallPathAssignOwnerAlert: '/alert/assign',
    CallPathSnoozeAlertCreate: '/alert/snooze',
    CallPathNoteToAlertModal: '/alert/note',

    CallPathIncomingWebhookPath: '/webhook'
}

const OpsGeniePaths = {
    AlertPathPrefix: '/alerts',
    NoteToAlertPathPrefix: `/alerts/${PathsVariable.Identifier}/notes`,
    CloseAlertPathPrefix: `/alerts/${PathsVariable.Identifier}/close`,
    UnacknowledgeAlertPathPrefix: `/alerts/${PathsVariable.Identifier}/unacknowledge`,
    AcknowledgeAlertPathPrefix: `/alerts/${PathsVariable.Identifier}/acknowledge`,
    AssignAlertPathPrefix: `/alerts/${PathsVariable.Identifier}/assign`,
    SnoozeAlertPathPrefix: `/alerts/${PathsVariable.Identifier}/snooze`,
    UserPathPrefix: `/users/${PathsVariable.Identifier}`,
    TeamPathPrefix: '/teams',
    APIVersionV2: '/v2',
};

const MattermostPaths = {
    PathKV: '/kv',
    PostsPath: '/posts',
    PostPath: `/posts/${PathsVariable.Identifier}`,
    UserPath: `/users/${PathsVariable.Identifier}`,
    DialogsOpenPath: '/actions/dialogs/open',
    ApiVersionV4: '/api/v4',
    ApiVersionV1: '/api/v1',
}

export const Routes = {
    PathsVariable,
    App: AppPaths,
    Mattermost: MattermostPaths,
    OpsGenie: OpsGeniePaths
};
