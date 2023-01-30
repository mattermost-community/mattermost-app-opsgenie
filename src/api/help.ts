import { Request, Response } from 'express';

import manifest from '../manifest.json';
import { newOKCallResponseWithMarkdown } from '../utils/call-responses';
import { AppActingUser, AppCallRequest, AppCallResponse, AppContext, ExpandedBotActingUser, Oauth2App } from '../types';
import { addBulletSlashCommand, h5, joinLines } from '../utils/markdown';
import { configureI18n } from '../utils/translations';
import { allowMemberAction } from '../utils/user-mapping';
import { existsOpsGenieAPIKey, isUserSystemAdmin } from '../utils/utils';
import { Commands } from '../constant';

export const getHelp = (request: Request, response: Response) => {
    const call: AppCallRequest = request.body;

    const helpText: string = [
        getHeader(call.context),
        getCommands(request.body),
    ].join('');
    const callResponse: AppCallResponse = newOKCallResponseWithMarkdown(helpText);
    response.json(callResponse);
};

function getHeader(context: AppContext): string {
    const i18nObj = configureI18n(context);

    return h5(i18nObj.__('api.help.title'));
}

function getCommands(call: AppCallRequest): string {
    const homepageUrl: string = manifest.homepage_url;
    const oauth2: Oauth2App = call.context.oauth2 as Oauth2App;
    const context = call.context as ExpandedBotActingUser;
    const actingUser: AppActingUser | undefined = context.acting_user;
    const commands: string[] = [];
    const i18nObj = configureI18n(call.context);

    commands.push(addBulletSlashCommand(Commands.HELP, i18nObj.__('api.help.command-help', { url: homepageUrl })));

    if (isUserSystemAdmin(<AppActingUser>actingUser)) {
        commands.push(addBulletSlashCommand(Commands.CONFIGURE, i18nObj.__('api.help.command-configure')));
    }

    if (existsOpsGenieAPIKey(oauth2)) {
        if (isUserSystemAdmin(<AppActingUser>actingUser)) {
            commands.push(addBulletSlashCommand(Commands.SETTINGS, i18nObj.__('api.help.command-settings')));
        }

        if (allowMemberAction(context)) {
            commands.push(addBulletSlashCommand(i18nObj.__('api.help.command-add-command', { command: Commands.SUBSCRIPTION, add: Commands.ADD }), i18nObj.__('api.help.command-add-description')));
            commands.push(addBulletSlashCommand(i18nObj.__('api.help.command-delete-command', { command: Commands.SUBSCRIPTION, delete: Commands.DELETE }), i18nObj.__('api.help.command-delete-description')));
            commands.push(addBulletSlashCommand(`${Commands.SUBSCRIPTION} ${Commands.LIST}`, i18nObj.__('api.help.command-list-description')));
        }
        commands.push(addBulletSlashCommand(i18nObj.__('api.help.command-create-command', { command: Commands.ALERT, create: Commands.CREATE }), i18nObj.__('api.help.command-create-description')));
        commands.push(addBulletSlashCommand(i18nObj.__('api.help.command-note-command', { command: Commands.ALERT, note: Commands.NOTE }), i18nObj.__('api.help.command-note-description')));
        commands.push(addBulletSlashCommand(i18nObj.__('api.help.command-snooze-command', { command: Commands.ALERT, snooze: Commands.SNOOZE }), i18nObj.__('api.help.command-snooze-decription')));
        commands.push(addBulletSlashCommand(i18nObj.__('api.help.command-ack-command', { command: Commands.ALERT, ack: Commands.ACK }), i18nObj.__('api.help.command-ack-description')));
        commands.push(addBulletSlashCommand(i18nObj.__('api.help.command-unack-command', { command: Commands.ALERT, unack: Commands.UNACK }), i18nObj.__('api.help.command-unack-description')));
        commands.push(addBulletSlashCommand(i18nObj.__('api.help.command-assign-command', { command: Commands.ALERT, assign: Commands.ASSIGN }), i18nObj.__('api.help.command-assign-description')));
        commands.push(addBulletSlashCommand(i18nObj.__('api.help.command-close-command', { command: Commands.ALERT, close: Commands.CLOSE }), i18nObj.__('api.help.command-close-description')));
        commands.push(addBulletSlashCommand(i18nObj.__('api.help.command-own-command', { command: Commands.ALERT, own: Commands.OWN }), i18nObj.__('api.help.command-own-description')));
        commands.push(addBulletSlashCommand(i18nObj.__('api.help.command-priority-command', { command: Commands.ALERT, priority: Commands.PRIORITY }), i18nObj.__('api.help.command-priority-description')));
        commands.push(addBulletSlashCommand(i18nObj.__('api.help.command-list-alert-command', { command: Commands.ALERT, list: Commands.LIST }), i18nObj.__('api.help.command-alert-decription')));
        commands.push(addBulletSlashCommand(`${Commands.LIST} ${Commands.TEAM}`, i18nObj.__('api.help.command-team-description')));
    }

    return `${joinLines(...commands)}`;
}
