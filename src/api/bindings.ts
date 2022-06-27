import {Request, Response} from 'express';
import {AppCallResponse, AppsState} from '../types';
import {newOKCallResponseWithData} from '../utils/call-responses';
import {getAppBindings} from '../bindings';

export const getBindings = async (request: Request, response: Response) => {
    const context = request.body;
    const bindings: AppsState[] = await getAppBindings(context);
    const callResponse: AppCallResponse = newOKCallResponseWithData(bindings);

    response.json(callResponse);
};

