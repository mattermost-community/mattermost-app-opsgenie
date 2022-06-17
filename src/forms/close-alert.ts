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
import {AckAlertForm, CloseAlertForm, StoreKeys} from '../constant';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {tryPromiseOpsgenieWithMessage} from '../utils/utils';
import { MattermostClient, MattermostOptions } from '../clients/mattermost';
import * as _ from 'lodash';

export async function closeAlertCall(call: AppCallRequest): Promise<void> {
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
    const response: ResponseResultWithData<Alert> = await tryPromiseOpsgenieWithMessage(opsGenieClient.getAlert(identifier), 'OpsGenie failed');
    const alert: Alert = response.data;

    if (alert.status === AlertStatus.CLOSED) {
        throw new Error(`You have closed #${alert.tinyId}`);
    }

    const data: AlertClose = {
        user: username
    };
    await tryPromiseOpsgenieWithMessage(opsGenieClient.closeAlert(identifier, data), 'OpsGenie failed');
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
    const response: ResponseResultWithData<Alert> = await tryPromiseOpsgenieWithMessage(opsGenieClient.getAlert(identifier), 'OpsGenie failed');
    const alert: Alert = response.data;
    if (alert.status === 'closed') {
        await updatePostCloseAlert(mattermostClient, postId);
        throw new Error(`You have closed #${alert.tinyId}`);
    }

    const data: AlertAck = {
        user: username
    };
    await tryPromiseOpsgenieWithMessage(opsGenieClient.closeAlert(identifier, data), 'OpsGenie failed');
    await updatePostCloseAlert(mattermostClient, postId);
}

async function updatePostCloseAlert(mattermostClient: MattermostClient, postId: string) {
    const currentPost = await tryPromiseOpsgenieWithMessage(mattermostClient.getPost(postId), 'Mattermost failed');

    const newProps = _.cloneDeep(currentPost.props);
    newProps.attachments[0].actions = [];
    newProps.attachments[0].color = "#AD251C";
    const updatePost: PostUpdate = {
        id: postId,
        props: newProps
    }
    await mattermostClient.updatePost(postId, updatePost);
}