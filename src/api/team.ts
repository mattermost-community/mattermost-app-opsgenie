import { Request, Response } from 'express';

import { AppCallRequest, AppCallResponse, AppContext, Teams } from '../types';
import { getAllTeamsCall } from '../forms/list-team';
import {
    newOKCallResponseWithMarkdown,
} from '../utils/call-responses';
import { h6, joinLines } from '../utils/markdown';
import { configureI18n } from '../utils/translations';
import { showMessageToMattermost } from '../utils/utils';

export const listTeamsSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;
    const call: AppCallRequest = request.body;

    try {
        const teams: Teams[] = await getAllTeamsCall(request.body);
        const teamsText: string = [
            getHeader(teams.length, call.context),
            getTeams(teams),
        ].join('');
        callResponse = newOKCallResponseWithMarkdown(teamsText);
        response.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        response.json(callResponse);
    }
};

function getHeader(teamsLength: number, context: AppContext): string {
    const i18nObj = configureI18n(context);

    return h6(i18nObj.__('api.team.message', { length: teamsLength.toString() }));
}

function getTeams(teams: Teams[]): string {
    return `${joinLines(
        teams.map((team: Teams) => `- ${team.name}`).join('\n')
    )}\n`;
}

