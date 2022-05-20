import axios from 'axios';
import {PostCreate} from '../types';

export interface MattermostOptions {
    mattermostUrl: string;
    accessToken: string | undefined;
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
}
