import {
    CallResponseHandler,
    newErrorCallResponseWithMessage,
    newFormCallResponse, newOKCallResponseWithData,
    newOKCallResponseWithMarkdown
} from '../utils/call-responses';
import {Account, AppCallRequest, AppCallResponse, ResponseResultWithData} from '../types';
import {opsGenieConfigForm, opsGenieConfigSubmit} from '../forms/configure-admin-account';
import {hyperlink} from '../utils/markdown';
import {Request, Response} from "express";
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from "../clients/kvstore";
import {OpsGenieClient, OpsGenieOptions} from "../clients/opsgenie";
import {StoreKeys} from "../constant";
import {showMessageToMattermost} from "../utils/utils";

export const configureAdminAccountForm: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: AppCallResponse;

    try {
        const form = await opsGenieConfigForm(req.body);
        callResponse = newFormCallResponse(form);
        res.json(callResponse);
    } catch (error: any) {
        callResponse = newErrorCallResponseWithMessage('Unable to open configuration form: ' + error.message);
        res.json(callResponse);
    }
};

export const configureAdminAccountSubmit: CallResponseHandler = async (req: Request, res: Response) => {
    let callResponse: AppCallResponse;

    try {
        await opsGenieConfigSubmit(req.body);
        callResponse = newOKCallResponseWithMarkdown('Successfully updated OpsGenie configuration');
        res.json(callResponse);
    } catch (error: any) {
        callResponse = showMessageToMattermost(error);
        res.json(callResponse);
    }
};

export const connectAccountLoginSubmit: CallResponseHandler = async (req: Request, res: Response) => {
    const call: AppCallRequest = req.body;
    const connectUrl: string = call.context.oauth2.connect_url;

    const callResponse: AppCallResponse = newOKCallResponseWithMarkdown(`Follow this ${hyperlink('link', connectUrl)} to connect Mattermost to your OpsGenie Account.`);
    res.json(callResponse);
};


export const fOauth2Connect: CallResponseHandler = async (req:  Request, res: Response) => {
    const call: AppCallRequest = req.body;
    const botAccessToken: string | undefined = call.context.bot_access_token;
    const mattermostUrl: string | undefined = call.context.mattermost_site_url;
    const state: string | undefined = call.values?.state;

    const kvOptions: KVStoreOptions = {
        accessToken: <string>botAccessToken,
        mattermostUrl: <string>mattermostUrl
    };
    const kvStore: KVStoreClient = new KVStoreClient(kvOptions);
    const kvProps: ConfigStoreProps = await kvStore.kvGet(StoreKeys.config);

    const opsProps: OpsGenieOptions = {
        api_key: kvProps.opsgenie_apikey
    };
    const opsGenieClient: OpsGenieClient = new OpsGenieClient(opsProps);

    const responseAccount: ResponseResultWithData<Account> = await opsGenieClient.getAccount();
    const account: Account = responseAccount.data;

    const url: string = `https://${account.name}.app.opsgenie.com/chatUserMapping/showSave`;
    const urlWithParams = new URL(url);
    //urlWithParams.searchParams.append('token', '65794a6a64584e306232316c636b6c6b496a6f694d475533595449325a4755745a474d304e5330304e7a4e6c4c546c6a5a6a63745a6a41344f44466a4d6a41784e44426849697769595856306147567564476c6a59585270623235556232746c62694936496a67315a4468695a5755304f4749345932466d4e6a4a6c4f5756694e32453159545530595755354d6a526a596d5935596a466c595442694f444a684e7a55355a5756695a6d4e684d6d4d795a44646c595463774f5755694c434a6a614746305647566862556c6b496a6f69626e4a6f61336b316132646c5a6d4a775a6e466b4e584676596d55344e6d396a5a6d38694c434a6a614746305647566862553568625755694f694a68626d4e705a57353049697769593268686446567a5a584a4a5a434936496a64754e446b324e6e4636596a646d4d5456344e6d746d636e526b613363334f573968496977695932686864465235634755694f694a4e5156525552564a4e54314e5549697769593268686446567a5a584a4f5957316c496a6f6962574631636d6c6a6157386966513d3d');
    urlWithParams.searchParams.append('token', 'b04ccf7a-7da9-4630-b2c1-634dfff445aa');
    console.log('urlWithParams', urlWithParams.href);

    const callResponse: AppCallResponse = newOKCallResponseWithData(urlWithParams.href);
    res.json(callResponse);
}

export const fOauth2Complete: CallResponseHandler = async (req: Request, res: Response) => {
    console.log('fOauth2Complete', req.body);
}
