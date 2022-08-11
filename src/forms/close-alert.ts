import {
    Alert,
    AlertAck,
    AlertClose,
    AlertStatus, AlertWebhook, AppCallAction,
    AppCallRequest,
    AppCallValues, AppContextAction,
    Identifier,
    IdentifierType,
    PostUpdate,
    ResponseResultWithData
} from '../types';
import {OpsGenieClient, OpsGenieOptions} from '../clients/opsgenie';
import {AckAlertForm, CloseAlertForm, ExceptionType, StoreKeys} from '../constant';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {getAlertLink, tryPromise} from '../utils/utils';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';
import * as _ from 'lodash';
import { Exception } from '../utils/exception';

export async function closeAlertCall(call: AppCallRequest): Promise<string> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const username: string | undefined = call.context.acting_user?.username;
    const values: AppCallValues | undefined = call.values;

    const alertTinyId: string = values?.[CloseAlertForm.NOTE_TINY_ID];

    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };
    const kvStoreClient = new KVStoreClient(options);

    const config: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);

    const optionsOpsgenie: OpsGenieOptions = {
        api_key: config.opsgenie_apikey
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY
    };
    const response: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN,  'OpsGenie failed');
    const alert: Alert = response.data;
    const alertURL: string = await getAlertLink(alertTinyId, alert.id, opsGenieClient);

    if (alert.status === AlertStatus.CLOSED) {
        throw new Exception(ExceptionType.MARKDOWN, `You already have closed ${alertURL}`, );
    }

    const data: AlertClose = {
        user: username
    };
    await tryPromise(opsGenieClient.closeAlert(identifier, data), ExceptionType.MARKDOWN,  'OpsGenie failed');
    return `Alert ${alertURL} will be closed`;
}

export async function closeAlertAction(call: AppCallAction<AppContextAction>): Promise<void> {
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const username: string | undefined = call.user_name;
    const values: AppCallValues | undefined = call.context.alert;
    const postId: string = call.post_id;

    const mattermostOptions: MattermostOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken
    };
    const mattermostClient: MattermostClient = new MattermostClient(mattermostOptions);

    const alertTinyId: string = values?.[AckAlertForm.TINY_ID];
    const options: KVStoreOptions = {
        mattermostUrl: <string>mattermostUrl,
        accessToken: <string>botAccessToken,
    };

    const kvStoreClient = new KVStoreClient(options);
    const config: ConfigStoreProps = await kvStoreClient.kvGet(StoreKeys.config);
    const optionsOpsgenie: OpsGenieOptions = {
        api_key: config.opsgenie_apikey
    };
    const opsGenieClient = new OpsGenieClient(optionsOpsgenie);

    const identifier: Identifier = {
        identifier: alertTinyId,
        identifierType: IdentifierType.TINY
    };
    const response: ResponseResultWithData<Alert> = await tryPromise(opsGenieClient.getAlert(identifier), ExceptionType.MARKDOWN, 'OpsGenie failed');
    const alert: Alert = response.data;
    if (alert.status === 'closed') {
        await updatePostCloseAlert(mattermostClient, postId);
        throw new Error(`You have closed #${alert.tinyId}`);
    }

    const data: AlertAck = {
        user: username
    };
    await tryPromise(opsGenieClient.closeAlert(identifier, data), ExceptionType.MARKDOWN, 'OpsGenie failed');
    await updatePostCloseAlert(mattermostClient, postId);
}

async function updatePostCloseAlert(mattermostClient: MattermostClient, postId: string) {
    const currentPost = await tryPromise(mattermostClient.getPost(postId), ExceptionType.MARKDOWN, 'Mattermost failed');

    const newProps = _.cloneDeep(currentPost.props);
    newProps.attachments[0].actions = [];
    newProps.attachments[0].color = "#AD251C";
    const updatePost: PostUpdate = {
        id: postId,
        props: newProps
    }
    await mattermostClient.updatePost(postId, updatePost);
}