import { Request, Response } from 'express';

import { Manifest } from '../types';
import manifest from '../manifest.json';
import { getHTTPPath } from '../utils/utils';

export function getManifest(request: Request, response: Response): void {
    let m: Manifest = manifest;
    const http = {
        http: {
            root_url: getHTTPPath(),
        },
    };

    m = { ...m, ...http };

    response.json(m);
}
