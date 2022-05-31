import express, {Router} from 'express';
import {Routes} from '../constant';
import * as cManifest from './manifest';
import * as cBindings from './bindings';
import * as cInstall from './install';
import * as cConfigure from './configure';
import * as cHelp from './help';
import * as cAlert from './alert';
import * as cTeam from './team';
import * as cWebhook from './webhook';
import {addNoteToAlertSubmit} from "./alert";

const router: Router = express.Router();

router.get(Routes.App.ManifestPath, cManifest.getManifest);
router.post(Routes.App.BindingsPath, cBindings.getBindings);
router.post(Routes.App.InstallPath, cInstall.getInstall);

router.post(`${Routes.App.CallPathHelp}`, cHelp.getHelp);
router.post(`${Routes.App.CallPathConfigForm}`, cConfigure.configureAdminAccountForm);
router.post(`${Routes.App.CallPathConfigSubmit}`, cConfigure.configureAdminAccountSubmit);

router.post(`${Routes.App.CallPathTeamsListSubmit}`, cTeam.listTeamsSubmit);

router.post(`${Routes.App.CallPathAlertCreate}`, cAlert.createAlert);
router.post(`${Routes.App.CallPathNoteToAlertModal}`, cAlert.addNoteToAlertSubmit);
router.post(`${Routes.App.CallPathAlertClose}`, cAlert.closeAlertSubmit);

router.post(`${Routes.App.CallPathAlertUnacknowledge}`, cAlert.followupAlert);
router.post(`${Routes.App.CallPathAlertAcknowledged}`, cAlert.followupAlert);
router.post(`${Routes.App.CallPathAlertOtherActions}`, cAlert.otherActionsAlert);
router.post(`${Routes.App.CallPathCloseOptions}`, cAlert.closeActionsAlert);
router.post(`${Routes.App.CallPathAssignOwnerAlert}`, cAlert.assignOwnerToAlert);
router.post(`${Routes.App.CallPathSnoozeAlertCreate}`, cAlert.createSnoozeAlert);

router.post(`${Routes.App.CallPathIncomingWebhookPath}`, cWebhook.incomingWebhook);

const staticRouter = express.Router();
staticRouter.use(express.static('static'));
router.use('/static', staticRouter);

export default router;
