import {Request, Response} from 'express';
import {AppCallResponse} from '../types';
import {newOKCallResponseWithMarkdown} from '../utils/call-responses';
import manifest from '../manifest.json';

export const getInstall = async (request: Request, response: Response) => {
    const homepageURL: string = manifest.homepage_url;

    const message: string = `
        **OpsGenie is now installed!**\n\n
        To finish configuring the Opsgenie app please read the [Quick Start](${homepageURL}#quick-start) section of the README.\n
    `;
    const callResponse: AppCallResponse = newOKCallResponseWithMarkdown(message);

    response.json(callResponse);
};

