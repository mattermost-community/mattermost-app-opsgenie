import axios from 'axios';
import {PostCreate, PostUpdate} from '../types';

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
}
