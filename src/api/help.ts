import {Request, Response} from 'express';
import manifest from '../manifest.json';
import {CommandTrigger} from '../constant';
import {newOKCallResponseWithMarkdown} from "../utils/call-responses";
import {AppCallResponse} from "../types";

export const getHelp = async (request: Request, response: Response) => {
    const helpText: string = [
        getHeader(),
        getCommands()
    ].join('');
    const callResponse: AppCallResponse = newOKCallResponseWithMarkdown(helpText);
    response.json(callResponse);
};

function getHeader(): string {
    return h5(`Mattermost OpsGenie Plugin - Slash Command Help`);
}

function getCommands(): string {
    const homepageUrl: string = manifest.homepage_url;
    return `${joinLines(
        addBulletSlashCommand('help', `Launch the Jira plugin command line help syntax, check out the [documentation](${homepageUrl}).`),
        addBulletSlashCommand('alert', 'Create a new alert.'),
    )}\n`;
}

function addBullet(text: string): string {
    return `* ${text}`;
}

function addBulletSlashCommand(text: string, description: string): string {
    return `* \`/${CommandTrigger} ${text}\` - ${description}`;
}

function h5(text: string): string {
    return `##### ${text}\n`;
}

function h4(text: string): string {
    return `#### ${text}\n`;
}

function textLine(text: string): string {
    return `${text}\n`;
}

function joinLines(...lines: string[]): string {
    return lines.join('\n');
}
