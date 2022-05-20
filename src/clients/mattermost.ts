import axios from 'axios';
import {DialogProps, PostCreate, PostUpdate} from '../types';
import {Routes} from '../constant';

export interface MattermostOptions {
    mattermostUrl: string;
    accessToken: string;
}

export class MattermostClient {
    private readonly config: MattermostOptions;

    constructor(
        config: MattermostOptions
    ) {
        this.config = config;
    }

    public createPost(post: PostCreate): Promise<any> {
        return axios.post(this.config.mattermostUrl, post, {
            headers: {
                Authorization: `Bearer ${this.config.accessToken}`
            }
        });
    }

    public updatePost(postId: string, post: PostUpdate): Promise<any> {
        return axios.put(`${this.config.mattermostUrl}/${postId}`, post, {
            headers: {
                Authorization: `Bearer ${this.config.accessToken}`
            }
        });
    }

    public showDialog(dialog: DialogProps): Promise<any> {
        const url: string = `${this.config.mattermostUrl}${Routes.Mattermost.ApiVersionV4}${Routes.Mattermost.DialogsOpenPath}`;
        return axios.post(url, dialog, {
            headers: {
                Authorization: `Bearer ${this.config.accessToken}`
            }
        });
    }
}
