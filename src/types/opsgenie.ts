import { WebhookAppCallRequest } from './apps';
import { WebhookFunction } from './functions';

export enum AlertStatus {
    CLOSED = 'closed',
    OPEN = 'open'
}

export enum IdentifierType {
    ID = 'id',
    TINY = 'tiny',
    USERNAME = 'username',
    NAME = 'name'
}

export enum AlertOption {
    ASKED = 'acked',
    UNACKED = 'unacked'
}

export enum AlertResponderType {
    TEAM = 'team',
    USER = 'user',
    ESCALATION = 'escalation',
    SCHEDULE = 'schedule'
}

export enum IntegrationType {
    API = 'API',
    MATTERMOST = 'Mattermost',
    SLACKAPP = 'SlackApp',
    WEBHOOK = 'Webhook'
}

export type ResponseResult = {
    result: string;
    took: number;
    requestId: string;
}

export type ResponseResultWithData<T> = {
    took: number;
    requestId: string;
    data: T
}

export type OpsUser = {
    blocked: boolean;
    verified: boolean;
    id: string;
    username: string;
    fullName: string;
    role: {
        id: string;
        name: string;
    };
    timeZone: string;
    locale: string;
    userAddress: {
        country: string;
        state: string;
        city: string;
        line: string;
        zipCode: string;
    };
    createdAt: string;
}

export type Alert = {
    seen: boolean;
    id: string;
    tinyId: string;
    alias: string;
    message: string;
    status: string;
    acknowledged: boolean;
    isSeen: boolean;
    tags: any[];
    snoozed: boolean;
    count: number;
    lastOccurredAt: Date;
    createdAt: Date;
    updatedAt: Date;
    source: string;
    owner: string;
    priority: string;
    teams: any[];
    responders: any[];
    integration: any[];
    ownerTeamId: string;
}

export type ActionResponse = {
    id: string;
};

export type IntegrationCreate = {
    type: string;
    name: string;
    url: string;
    allowWriteAccess: boolean;
    allowReadAccess: boolean;
    allowConfigurationAccess: boolean;
    ownerTeam: {
        id?: string;
        name?: string;
    }
};

export type Integrations = {
    id: string;
    name: string;
    enabled: boolean;
    type: string;
    teamId: string;
    version: string;
}

export type Integration = {
    _readOnly: string[];
    addAlertDescription: boolean;
    addAlertDetails: boolean;
    alertFilter: {
        conditionMatchType: string;
        conditions: any[];
    };
    forwardingActionMappings: any[];
    forwardingEnabled: boolean;
    headers: any;
    url: string;
    enabled: boolean;
    isGlobal: boolean;
    name: string;
    ownerTeam: {
        id: string;
        name: string;
    };
    type: string;
}

export interface Subscription extends Integration {
    integrationId: string;
    channelId: string;
    channelName: string;
}

export type Account = {
    name: string;
    userCount: number;
    plan: {
        maxUserCount: number;
        name: string;
        isYearly: boolean;
    }
}

export type Teams = {
    id: string;
    name: string;
    description: string;
};

export type TeamMember = {
    user: {
        id: string;
        username: string;
    },
    role: string;
}

export type Team = {
    id: string;
    name: string;
    description: string;
    members?: TeamMember[];
    links: any[];
}

export type AlertCreate = {
    message: string;
    priority?: string;
    responders?: {
        type?: string;
        id?: string;
        username?: string;
        name?: string;
    }[];
};

export type PriorityAlert = {
    priority: string;
    user?: string;
    source?: string;
    note?: string;
};

export type AlertAssign = {
    owner: {
        id?: string;
        username?: string;
    };
    user?: string;
    source?: string;
    note?: string;
}

export type AlertNote = {
    note: string;
    user?: string;
    source?: string;
};

export type AlertUnack = {
    note?: string;
    user?: string;
    source?: string;
};

export type AlertClose = {
    note?: string;
    user?: string;
    source?: string;
};

export type AlertAck = {
    note?: string;
    user?: string;
    source?: string;
};

export type AlertSnooze = {
    note?: string;
    user?: string
    source?: string;
    endTime: string;
};

export type Identifier = {
    identifier: string;
    identifierType: string;
};

export type AlertOrder = 'desc' | 'asc';

export type ListAlertParams = {
    query?: string;
    searchIdentifier?: string;
    searchIdentifierType?: string;
    offset?: number;
    limit?: number;
    sort?: string;
    order?: AlertOrder;
}

export type ListIntegrationsParams = {
    type?: string;
    teamId?: string;
    teamName?: string;
}

export type WebhookRequestValues = {
    alertId: string;
    message: string;
    tags: any[];
    tinyId: string;
    entity: string;
    alias: string;
    createdAt: Date;
    updatedAt: Date;
    username: string;
    userId: string;
    note: string;
    description: string;
    owner: string;
    team: string;
    responders: any[];
    teams: any[];
    actions: any[];
    snoozeEndDate: string;
    snoozedUntil: string;
    details: any;
    priority: string;
    oldPriority: string;
    source: string;
}

export type AlertWebhook = WebhookRequestValues & {
    alertId: string;
    message: string;
    tags: any[];
    tinyId: string;
    entity: string;
    alias: string;
    createdAt: Date;
    updatedAt: Date;
    username: string;
    description: string;
    team: string;
    responders: any[];
    teams: any[];
    actions: any[];
    details: any;
    priority: string;
    source: string;
}

export type NoteWebhook = WebhookRequestValues & {
    alertId: string;
    message: string;
    tags: any[];
    tinyId: string;
    entity: string;
    alias: string;
    createdAt: Date;
    updatedAt: Date;
    username: string;
    note: string;
    description: string;
    responders: any[];
    teams: any[];
    actions: any[];
    details: any;
    priority: string;
    oldPriority: string;
    source: string;
}

export type SnoozeWebhook = WebhookRequestValues & {
    alertId: string;
    message: string;
    tags: any[];
    tinyId: string;
    entity: string;
    alias: string;
    createdAt: Date;
    updatedAt: Date;
    username: string;
    userId: string;
    description: string;
    responders: any[];
    teams: any[];
    actions: any[];
    snoozeEndDate: string;
    snoozedUntil: string;
    details: any;
    priority: string;
    oldPriority: string;
    source: string;
}

export type AssignWebhook = WebhookRequestValues &{
    alertId: string;
    message: string;
    tags: any[];
    tinyId: string;
    entity: string;
    alias: string;
    createdAt: Date;
    updatedAt: Date;
    username: string;
    description: string;
    owner: string;
    responders: any[];
    teams: any[];
    actions: any[];
    details: any;
    priority: string;
    oldPriority: string;
    source: string;
}

export type WebhookDataAction = 'Create' | 'AddNote' | 'Close' | 'Acknowledge' | 'UnAcknowledge' | 'Snooze' | 'SnoozeEnded' | 'AssignOwnership' | 'UpdatePriority';

export type WebhookData<T> = {
    action: WebhookDataAction;
    alert: T;
    source: {
        name: string;
        type: string;
    };
    integrationName: string;
    integrationId: string;
    integrationType: string;
}

export type WebhookRequest<T> = {
    data: WebhookData<T>,
    headers: {
        Accept: string;
        'Accept-Encoding': string;
        'Content-Length': string;
        'Content-Type': string;
        'Mattermost-Session-Id': string;
        'User-Agent': string;
        'X-Forwarded-For': string;
        'X-Forwarded-Proto': string;
    }
    httpMethod: string;
    rawQuery: string;
}

export type WebhookFunctionType = WebhookFunction<AlertWebhook> | WebhookFunction<NoteWebhook> | WebhookFunction<SnoozeWebhook> | WebhookFunction<AssignWebhook>
export type WebhookAppCallRequestType = WebhookAppCallRequest<AlertWebhook> | WebhookAppCallRequest<NoteWebhook> | WebhookAppCallRequest<SnoozeWebhook> | WebhookAppCallRequest<AssignWebhook>;