export type ResponseResult = {
    result: string;
    took: number;
    requestId: string;
}

export type AlertCreate = {
    message: string;
};

export type AlertIdentifier = {
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
