export type ResponseResult = {
    result: string;
    took: number;
    requestId: string;
}

export type AlertCreate = {
    message: string;
};

export type NoteToAlertIdentifier = {
    identifier: string;
    identifierType: string;
};

export type NoteToAlertCreate = {
    note: string;
    user: string;
    source: string;
};
