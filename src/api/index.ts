import express, { Router } from 'express';

import { Routes } from '../constant';

import { requireSystemAdmin } from '../restapi/middleware';

import * as cManifest from './manifest';
import * as cBindings from './bindings';
import * as cInstall from './install';
import * as cConfigure from './configure';
import * as cHelp from './help';
import * as cAlert from './alert';
import * as cTeam from './team';
import * as cSubscription from './subscription';
import * as cWebhook from './webhook';

const router: Router = express.Router();

router.get(Routes.App.ManifestPath, cManifest.getManifest);
router.post(Routes.App.BindingsPath, cBindings.getBindings);
router.post(Routes.App.InstallPath, cInstall.getInstall);

router.post(`${Routes.App.CallPathHelp}`, cHelp.getHelp);

router.post(`${Routes.App.CallPathConfigForm}`, requireSystemAdmin, cConfigure.configureAdminAccountForm);
router.post(`${Routes.App.CallPathConfigSubmit}`, requireSystemAdmin, cConfigure.configureAdminAccountSubmit);

router.post(`${Routes.App.CallPathSubscriptionAddForm}`, cSubscription.subscriptionAddForm);
router.post(`${Routes.App.CallPathSubscriptionAddSubmit}`, cSubscription.subscriptionAddSubmit);
router.post(`${Routes.App.CallPathSubscriptionDeleteForm}`, cSubscription.subscriptionDeleteForm);
router.post(`${Routes.App.CallPathSubscriptionDeleteSubmit}`, cSubscription.subscriptionDeleteSubmit);
router.post(`${Routes.App.CallPathSubscriptionListSubmit}`, cSubscription.subscriptionListSubmit);

router.post(`${Routes.App.CallPathTeamsListSubmit}`, cTeam.listTeamsSubmit);
router.post(`${Routes.App.CallPathAlertsListSubmit}`, cAlert.listAlertsSubmit);

router.post(`${Routes.App.CallPathAlertCreate}`, cAlert.createAlertSubmit);

router.post(`${Routes.App.CallPathNoteToAlertSubmit}`, cAlert.addNoteToAlertSubmit);
router.post(`${Routes.App.CallPathNoteToAlertAction}`, cAlert.addNoteToAlertModal);

router.post(`${Routes.App.CallPathAlertCloseSubmit}`, cAlert.closeAlertSubmit);
router.post(`${Routes.App.CallPathAlertCloseAction}`, cAlert.closeAlertModal);

router.post(`${Routes.App.CallPathAlertAcknowledgedSubmit}`, cAlert.ackAlertSubmit);
router.post(`${Routes.App.CallPathAlertAcknowledgedAction}`, cAlert.ackAlertModal);

router.post(`${Routes.App.CallPathAlertUnacknowledge}`, cAlert.unackAlertSubmit);
router.post(`${Routes.App.CallPathAlertUnacknowledgeAction}`, cAlert.unackAlertModal);

router.post(`${Routes.App.CallPathSnoozeAlert}`, cAlert.snoozeAlertSubmit);
router.post(`${Routes.App.CallPathSnoozeAlertAction}`, cAlert.snoozeAlertModal);

router.post(`${Routes.App.CallPathAssignAlertSubmit}`, cAlert.assignAlertSubmit);
router.post(`${Routes.App.CallPathAssignAlertAction}`, cAlert.assignAlertModal);

router.post(`${Routes.App.CallPathTakeOwnershipAlertSubmit}`, cAlert.takeOwnershipAlertSubmit);
router.post(`${Routes.App.CallPathUpdatePriorityAlertSubmit}`, cAlert.priorityAlertSubmit);

router.post(`${Routes.App.CallPathAlertOtherActions}`, cAlert.otherActionsAlert);
router.post(`${Routes.App.CallPathCloseOptions}`, cAlert.closeActionsAlert);

router.post(`${Routes.App.CallPathIncomingWebhookPath}`, cWebhook.incomingWebhook);

const staticRouter = express.Router();
staticRouter.use(express.static('static'));
router.use('/static', staticRouter);

export default router;
