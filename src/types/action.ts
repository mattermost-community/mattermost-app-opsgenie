export type CloseAlertAction = {
    action: string;
    alert_id: string;
    alert: {
        id: string;
        message: string;
        tinyId: string;
    }
    mattermost_site_url: string;
    bot_access_token: string;
}
