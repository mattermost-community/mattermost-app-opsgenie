export enum IdentifierType {
    ID = 'id',
    TINY = 'tiny'
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

export type Identifier = {
    identifier: string;
    identifierType: string;
};

export type NoteToAlertCreate = {
    note: string;
    user: string;
    source: string;
};

export type SnoozeAlertCreate = {
    note: string;
    user: string
    source: string;
    endTime: String;
};

export type AssignOwnerToAlertCreate = {
    note: string;
    user: string;
    source: string;
    owner: {
        username: string;
    }
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
