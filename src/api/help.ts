import {Request, Response} from 'express';
import manifest from '../manifest.json';
import {newOKCallResponseWithMarkdown} from "../utils/call-responses";
import {AppCallResponse} from "../types";
import {addBulletSlashCommand, h5, joinLines} from "../utils/markdown";

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
        addBulletSlashCommand('help', `Launch the OpsGenie plugin command line help syntax, check out the [documentation](${homepageUrl}).`),
        addBulletSlashCommand('configure', `Configure OpsGenie.`),
        addBulletSlashCommand('alert', 'Create a new alert.'),
    )}\n`;
}
