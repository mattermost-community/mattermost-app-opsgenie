import {Request, Response} from 'express';
import manifest from '../manifest.json';
import {newOKCallResponseWithMarkdown} from '../utils/call-responses';
import {AppCallRequest, AppCallResponse} from '../types';
import {addBulletSlashCommand, h5, joinLines} from '../utils/markdown';

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
    const context = call.context as any;
    const text: string = getUserCommands();

    return text;
}

function getUserCommands(): string {
    const homepageUrl: string = manifest.homepage_url;
    return `${joinLines(
        addBulletSlashCommand('help', `Launch the OpsGenie plugin command line help syntax, check out the [documentation](${homepageUrl}).`),
        addBulletSlashCommand('alert', 'Create a new alert.'),
        addBulletSlashCommand('team', 'List teams.'),
    )}\n`;
}

function getAdminCommands(): string {
    const homepageUrl: string = manifest.homepage_url;
    return `${joinLines(
        addBulletSlashCommand('help', `Launch the OpsGenie plugin command line help syntax, check out the [documentation](${homepageUrl}).`),
        addBulletSlashCommand('configure', `Configure OpsGenie.`),
    )}\n`;
}
