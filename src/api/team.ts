import {Request, Response} from 'express';
import {AppCallResponse, Teams} from '../types';
import {getAllTeamsCall} from '../forms/list-team';
import {
    newErrorCallResponseWithMessage,
    newOKCallResponseWithMarkdown
} from '../utils/call-responses';
import {h6, joinLines} from "../utils/markdown";

export const listTeamsSubmit = async (request: Request, response: Response) => {
    let callResponse: AppCallResponse;

    try {
        const teams: Teams[] = await getAllTeamsCall(request.body);
        const teamsText: string = [
            getHeader(teams.length),
            getTeams(teams)
        ].join('');
        callResponse = newOKCallResponseWithMarkdown(teamsText);
        response.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('OpsGenie error: ' + error.message);
        response.json(callResponse);
    }
};

function getHeader(teamsLength: number): string {
    return h6(`Team List: Found ${teamsLength} matching teams.`);
}

function getTeams(teams: Teams[]): string {
    return `${joinLines(
        teams.map((team) => `- ${team.name}`).join('\n')
    )}\n`;
}

