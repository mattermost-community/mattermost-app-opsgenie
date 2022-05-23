import axios, {AxiosResponse} from 'axios';
import {DialogProps, PostCreate, PostUpdate} from '../types';
import {Routes} from '../constant';
import {replace} from "../utils/utils";

export interface MattermostOptions {
    mattermostUrl: string;
    accessToken: string | null | undefined;
}

export class MattermostClient {
    private readonly config: MattermostOptions;

    constructor(
        config: MattermostOptions
    ) {
        this.config = config;
    }

    public createPost(post: PostCreate): Promise<any> {
        const url: string = `${this.config.mattermostUrl}${Routes.Mattermost.ApiVersionV4}${Routes.Mattermost.PostsPath}`;
        return axios.post(url, post, {
            headers: {
                Authorization: `Bearer ${this.config.accessToken}`
            }
        }).then((response: AxiosResponse<any>) => response.data);
    }

    public updatePost(postId: string, post: PostUpdate): Promise<any> {
        const url: string = `${this.config.mattermostUrl}${Routes.Mattermost.ApiVersionV4}${Routes.Mattermost.PostPath}`;
        return axios.put(replace(url, Routes.PathsVariable.Identifier, postId), post, {
            headers: {
                Authorization: `Bearer ${this.config.accessToken}`
            }
        }).then((response: AxiosResponse<any>) => response.data);
    }

    public deletePost(postId: string): Promise<any> {
        const url: string = `${this.config.mattermostUrl}${Routes.Mattermost.ApiVersionV4}${Routes.Mattermost.PostPath}`;
        return axios.delete(replace(url, Routes.PathsVariable.Identifier, postId), {
            headers: {
                Authorization: `Bearer ${this.config.accessToken}`
            }
        }).then((response: AxiosResponse<any>) => response.data);
    }

    public showDialog(dialog: DialogProps): Promise<any> {
        const url: string = `${this.config.mattermostUrl}${Routes.Mattermost.ApiVersionV4}${Routes.Mattermost.DialogsOpenPath}`;
        return axios.post(url, dialog, {
            headers: {
                Authorization: `Bearer ${this.config.accessToken}`
            }
        }).then((response: AxiosResponse<any>) => response.data);
    }

    public incomingWebhook(data: {[key: string]: any}): Promise<any> {
        return axios.post(this.config.mattermostUrl, data)
            .then((response: AxiosResponse<any>) => response.data);
    }
}
