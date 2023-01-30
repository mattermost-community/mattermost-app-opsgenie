import axios, { AxiosResponse } from 'axios';

import { Oauth2App } from '../types';

import { AppsPluginName, Routes } from '../constant';
import { routesJoin } from '../utils/utils';

export interface KVStoreOptions {
    mattermostUrl: string;
    accessToken: string;
}

export interface ConfigStoreProps {
    opsgenie_apikey: string;
}

export class KVStoreClient {
    private readonly config: KVStoreOptions;

    constructor(
        config: KVStoreOptions
    ) {
        this.config = config;
    }

    public storeOauth2App(data: Oauth2App): Promise<any> {
        const url = routesJoin([this.config.mattermostUrl, '/plugins/', AppsPluginName, Routes.Mattermost.ApiVersionV1, Routes.Mattermost.PathOAuth2App]);
        return axios.post(url, data, {
            headers: {
                Authorization: `BEARER ${this.config.accessToken}`,
                'content-type': 'application/json; charset=UTF-8',
            },
        }).then((response: AxiosResponse<any>) => response.data);
    }

    public kvSet(key: string, value: ConfigStoreProps): Promise<any> {
        const url = routesJoin([this.config.mattermostUrl, '/plugins/', AppsPluginName, Routes.Mattermost.ApiVersionV1, Routes.Mattermost.PathKV, '/', key]);
        return axios.post(url, value, {
            headers: {
                Authorization: `BEARER ${this.config.accessToken}`,
                'content-type': 'application/json; charset=UTF-8',
            },
        }).then((response: AxiosResponse<any>) => response.data);
    }

    public kvGet(key: string): Promise<ConfigStoreProps> {
        const url = routesJoin([this.config.mattermostUrl, '/plugins/', AppsPluginName, Routes.Mattermost.ApiVersionV1, Routes.Mattermost.PathKV, '/', key]);
        return axios.get(url, {
            headers: {
                Authorization: `BEARER ${this.config.accessToken}`,
                'content-type': 'application/json; charset=UTF-8',
            },
        }).then((response: AxiosResponse<any>) => response.data);
    }
}
