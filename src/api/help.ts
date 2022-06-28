import {Request, Response} from 'express';
import manifest from '../manifest.json';
import {newOKCallResponseWithMarkdown} from '../utils/call-responses';
import {AppCallRequest, AppCallResponse, ExpandedBotActingUser} from '../types';
import {addBulletSlashCommand, h5, joinLines} from '../utils/markdown';
import {isUserSystemAdmin} from '../utils/utils';

export const getHelp = async (request: Request, response: Response) => {
    const helpText: string = [
        getHeader(),
        getCommands(request.body)
    ].join('');
    const callResponse: AppCallResponse = newOKCallResponseWithMarkdown(helpText);
    response.json(callResponse);
};

function getHeader(): string {
    return h5(`Mattermost OpsGenie Plugin - Slash Command Help`);
}

function getCommands(call: AppCallRequest): string {
    const context = call.context as ExpandedBotActingUser;

    return isUserSystemAdmin(context.acting_user)
        ? getAdminCommands()
        : getUserCommands();
}

function getUserCommands(): string {
    const homepageUrl: string = manifest.homepage_url;
    return `${joinLines(
        addBulletSlashCommand('help', `Launch the OpsGenie plugin command line help syntax, check out the [documentation](${homepageUrl}).`),
        addBulletSlashCommand('connect', `Connect your OpsGenie account`),
        addBulletSlashCommand('subscription add [Team name] [Channel mattermost]', `Add subscription of team to channel`),
        addBulletSlashCommand('subscription delete [SubscriptionId]', `Delete subscription of channel`),
        addBulletSlashCommand('subscription list', `List subscriptions open`),
        addBulletSlashCommand('alert create [Alert message] [Team name] [Priority]', 'Create an alert with the message for the specified responders'),
        addBulletSlashCommand('alert note [Note message] [TinyId]', 'Add [note] to the alerts with IDs [tinyID tinyID2..]'),
        addBulletSlashCommand('alert snooze [TinyID] [time amount [m/h/d]]', 'Snooze the alerts with IDs [tinyID tinyID2..] for the specified time.'),
        addBulletSlashCommand('alert ack [TinyID]', 'Acknowledge the alerts with IDs [tinyID tinyID2..].'),
        addBulletSlashCommand('alert unack [TinyID]', 'UnAcknowledge the alerts with IDs [tinyID tinyID2..]'),
        addBulletSlashCommand('alert assign [TinyID] [User mattermost]', 'Assign alerts with IDs [tinyID tinyID2..] to [user]'),
        addBulletSlashCommand('alert close [TinyID]', 'Close the alerts, incidents, mass notifications with IDs [tinyID tinyID2..]'),
        addBulletSlashCommand('alert own [TinyID]', 'Take ownership of the alerts with IDs [tinyID tinyID2..]'),
        addBulletSlashCommand('alert priority [TinyID] [Priority]', 'Update priority of the alert with [tinyID].'),
        addBulletSlashCommand('list team', 'List teams.'),
        addBulletSlashCommand('list alert', 'List alerts.'),
    )}\n`;
}

function getAdminCommands(): string {
    const homepageUrl: string = manifest.homepage_url;
    return `${joinLines(
        addBulletSlashCommand('help', `Launch the OpsGenie plugin command line help syntax, check out the [documentation](${homepageUrl}).`),
        addBulletSlashCommand('configure', `Configure OpsGenie.`),
        addBulletSlashCommand('connect', `Connect your OpsGenie account`),
        addBulletSlashCommand('subscription add [Team name] [Channel mattermost]', `Add subscription of team to channel`),
        addBulletSlashCommand('subscription delete [SubscriptionId]', `Delete subscription of channel`),
        addBulletSlashCommand('subscription list', `List subscriptions open`),
        addBulletSlashCommand('alert create [Alert message] [Team name] [Priority]', 'Create an alert with the message for the specified responders'),
        addBulletSlashCommand('alert note [Note message] [TinyId]', 'Add [note] to the alerts with IDs [tinyID tinyID2..]'),
        addBulletSlashCommand('alert snooze [TinyID] [time amount [m/h/d]]', 'Snooze the alerts with IDs [tinyID tinyID2..] for the specified time.'),
        addBulletSlashCommand('alert ack [TinyID]', 'Acknowledge the alerts with IDs [tinyID tinyID2..].'),
        addBulletSlashCommand('alert unack [TinyID]', 'UnAcknowledge the alerts with IDs [tinyID tinyID2..]'),
        addBulletSlashCommand('alert assign [TinyID] [User mattermost]', 'Assign alerts with IDs [tinyID tinyID2..] to [user]'),
        addBulletSlashCommand('alert close [TinyID]', 'Close the alerts, incidents, mass notifications with IDs [tinyID tinyID2..]'),
        addBulletSlashCommand('alert own [TinyID]', 'Take ownership of the alerts with IDs [tinyID tinyID2..]'),
        addBulletSlashCommand('alert priority [TinyID] [Priority]', 'Update priority of the alert with [tinyID].'),
        addBulletSlashCommand('list team', 'List teams.'),
        addBulletSlashCommand('list alert', 'List alerts.'),
    )}\n`;
}
