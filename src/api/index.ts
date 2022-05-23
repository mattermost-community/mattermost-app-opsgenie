import express, {Router} from 'express';
import {Routes} from '../constant';
import * as cManifest from './manifest';
import * as cBindings from './bindings';
import * as cInstall from './install';
import * as cHelp from './help';
import * as cAlert from './alert';
import * as cWebhook from './webhook';

const router: Router = express.Router();

router.get(Routes.App.ManifestPath, cManifest.getManifest);
router.post(Routes.App.BindingsPath, cBindings.getBindings);
router.post(Routes.App.InstallPath, cInstall.getInstall);

router.post(`${Routes.App.BindingPathHelp}`, cHelp.getHelp);
router.post(`${Routes.App.CallPathAlertCreate}`, cAlert.createAlert);
router.post(`${Routes.App.CallPathAlertClose}`, cAlert.closeAlert);
router.post(`${Routes.App.CallPathAlertUnacknowledge}`, cAlert.followupAlert);
router.post(`${Routes.App.CallPathAlertAcknowledged}`, cAlert.followupAlert);
router.post(`${Routes.App.CallPathAlertOtherActions}`, cAlert.otherActionsAlert);
router.post(`${Routes.App.CallPathCloseOptions}`, cAlert.closeActionsAlert);
router.post(`${Routes.App.CallPathAssignOwnerAlert}`, cAlert.assignOwnerToAlert);
router.post(`${Routes.App.CallPathSnoozeAlertCreate}`, cAlert.createSnoozeAlert);

router.post(`${Routes.App.CallPathNoteToAlertModal}`, cAlert.showModalNoteToAlert);

router.post(`${Routes.App.SubscribeIncomingWebhookPath}`, cWebhook.incomingWebhook);

const staticRouter = express.Router();
staticRouter.use(express.static('static'));
router.use('/static', staticRouter);

export default router;
