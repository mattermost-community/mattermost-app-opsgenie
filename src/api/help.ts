import {Request, Response} from 'express';
import manifest from '../manifest.json';
import {newOKCallResponseWithMarkdown} from '../utils/call-responses';
import {AppActingUser, AppCallRequest, AppCallResponse, ExpandedBotActingUser} from '../types';
import {addBulletSlashCommand, h5, joinLines} from '../utils/markdown';
import {existsKvOpsGenieConfig, isUserSystemAdmin} from '../utils/utils';
import { KVStoreClient, KVStoreOptions } from '../clients/kvstore';
import { Commands } from '../constant';

export const getHelp = async (request: Request, response: Response) => {
    const helpText: string = [
        getHeader(),
        await getCommands(request.body)
    ].join('');
    const callResponse: AppCallResponse = newOKCallResponseWithMarkdown(helpText);
    response.json(callResponse);
};

function getHeader(): string {
    return h5(`Mattermost OpsGenie Plugin - Slash Command Help`);
}

async function getCommands(call: AppCallRequest): Promise<string> {
    const homepageUrl: string = manifest.homepage_url;
    const context = call.context as ExpandedBotActingUser;
    const mattermostUrl: string | undefined = context.mattermost_site_url;
    const botAccessToken: string | undefined = context.bot_access_token;
    const actingUser: AppActingUser | undefined = context.acting_user;
    const actingUserID: string | undefined = actingUser.id;
    const commands: string[] = [];

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvClient = new KVStoreClient(options);

    commands.push(addBulletSlashCommand(Commands.HELP, `Launch the OpsGenie plugin command line help syntax, check out the [documentation](${homepageUrl}).`));
    if (isUserSystemAdmin(<AppActingUser>actingUser)) {
        commands.push(addBulletSlashCommand(Commands.CONFIGURE, `Configure OpsGenie.`));
    }
    if (await existsKvOpsGenieConfig(kvClient)) {
        commands.push(addBulletSlashCommand(`${Commands.ACCOUNT} ${Commands.LOGIN}`, `Connect your OpsGenie account.`));
        commands.push(addBulletSlashCommand(`${Commands.ACCOUNT} ${Commands.LOGOUT}`, `Disconnect from your OpsGenie account.`));

        commands.push(addBulletSlashCommand(`${Commands.SUBSCRIPTION} ${Commands.ADD} [Team name] [Mattermost Channel]`, `Add subscription of team to channel.`));
        commands.push(addBulletSlashCommand(`${Commands.SUBSCRIPTION} ${Commands.DELETE} [SubscriptionId]`, `Delete subscription of channel.`));
        commands.push(addBulletSlashCommand(`${Commands.SUBSCRIPTION} ${Commands.LIST}`, `List subscriptions open.`));
        commands.push(addBulletSlashCommand(`${Commands.ALERT} ${Commands.CREATE} [Alert message] [Team name] [Priority]`, `Create an alert with the message for the specified responders.`));
        commands.push(addBulletSlashCommand(`${Commands.ALERT} ${Commands.NOTE} [Note message] [Alert TinyId]`, `Add [note] to the alerts with IDs [tinyID tinyID2..].`));
        commands.push(addBulletSlashCommand(`${Commands.ALERT} ${Commands.SNOOZE} [Alert TinyID] [Time amount [m/h/d]]`, `Snooze the alerts with IDs [tinyID tinyID2..] for the specified time.`));
        commands.push(addBulletSlashCommand(`${Commands.ALERT} ${Commands.ACK} [Alert TinyID]`, `Acknowledge the alerts with IDs [tinyID tinyID2..].`));
        commands.push(addBulletSlashCommand(`${Commands.ALERT} ${Commands.UNACK} [Alert TinyID]`, `UnAcknowledge the alerts with IDs [tinyID tinyID2..].`));
        commands.push(addBulletSlashCommand(`${Commands.ALERT} ${Commands.ASSIGN} [Alert TinyID] [Mattermost User]`, `Assign alerts with IDs [tinyID tinyID2..] to [user].`));
        commands.push(addBulletSlashCommand(`${Commands.ALERT} ${Commands.CLOSE} [Alert TinyID] [Mattermost User]`, `Close the alerts, incidents, mass notifications with IDs [tinyID tinyID2..].`));
        commands.push(addBulletSlashCommand(`${Commands.ALERT} ${Commands.OWN} [Alert TinyID]`, `Take ownership of the alerts with IDs [tinyID tinyID2..].`));
        commands.push(addBulletSlashCommand(`${Commands.ALERT} ${Commands.PRIORITY} [Alert TinyID] [Priority]`, `Update priority of the alert with [tinyID].`));
        commands.push(addBulletSlashCommand(`${Commands.LIST} ${Commands.TEAM}`, 'List teams.'));
        commands.push(addBulletSlashCommand(`${Commands.LIST} ${Commands.ALERT}`, 'List alerts.'));
    }
    
    return `${joinLines(...commands)}`;
}
