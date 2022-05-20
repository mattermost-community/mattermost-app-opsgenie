export type PostCreate = {
    channel_id: string;
    message: string;
    props: {
        attachments: any[];
    }
}
