export enum IdentifierType {
    ID = 'id',
    TINY = 'tiny',
    USERNAME = 'username'
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

export type Integration = {
    id: string;
    name: string;
    enabled: boolean;
    type: string;
    teamId: string;
    version: string;
}

export type Team = {
    id: string;
    name: string;
    description: string;
    members: any[];
    links: any[];
}

export type AlertCreate = {
    message: string;
};

export type AlertAssign = {
    owner: {
        id: string;
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

export type AlertWebhook = {
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

export type WebhookRequest = {
    action: string;
    alert: AlertWebhook;
    source: {
        name: string;
        type: string;
    };
    integrationName: string;
    integrationId: string;
    integrationType: string;
}
