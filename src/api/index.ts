import express, { Router } from 'express';

import { Routes } from '../constant';

import { requireOpsGenieAPIKey, requireOpsGenieAllowUserMapping, requireSystemAdmin } from '../restapi/middleware';

import * as cManifest from './manifest';
import * as cBindings from './bindings';
import * as cInstall from './install';
import * as cConfigure from './configure';
import * as cHelp from './help';
import * as cAlert from './alert';
import * as cTeam from './team';
import * as cSubscription from './subscription';
import * as cWebhook from './webhook';
import * as cSettings from './settings';

const router: Router = express.Router();

router.get(Routes.App.ManifestPath, cManifest.getManifest);
router.post(Routes.App.BindingsPath, cBindings.getBindings);
router.post(Routes.App.InstallPath, cInstall.getInstall);

router.post(Routes.App.CallPathHelp, cHelp.getHelp);

router.post(Routes.App.CallPathConfigForm, requireSystemAdmin, cConfigure.configureAdminAccountForm);
router.post(Routes.App.CallPathConfigSubmit, requireSystemAdmin, cConfigure.configureAdminAccountSubmit);

router.post(Routes.App.CallPathSettingsForm, requireSystemAdmin, requireOpsGenieAPIKey, cSettings.appSettingsForm);
router.post(Routes.App.CallPathSettingsSubmit, requireSystemAdmin, requireOpsGenieAPIKey, cSettings.appSettingsSubmit);

router.post(Routes.App.CallPathSubscriptionAddForm, requireOpsGenieAPIKey, requireOpsGenieAllowUserMapping, cSubscription.subscriptionAddForm);
router.post(Routes.App.CallPathSubscriptionAddSubmit, requireOpsGenieAPIKey, requireOpsGenieAllowUserMapping, cSubscription.subscriptionAddSubmit);
router.post(Routes.App.CallPathSubscriptionDeleteForm, requireOpsGenieAPIKey, requireOpsGenieAllowUserMapping, cSubscription.subscriptionDeleteForm);
router.post(Routes.App.CallPathSubscriptionDeleteSubmit, requireOpsGenieAPIKey, requireOpsGenieAllowUserMapping, cSubscription.subscriptionDeleteSubmit);
router.post(Routes.App.CallPathSubscriptionListSubmit, requireOpsGenieAPIKey, requireOpsGenieAllowUserMapping, cSubscription.subscriptionListSubmit);

router.post(Routes.App.CallPathTeamsListSubmit, requireOpsGenieAPIKey, cTeam.listTeamsSubmit);

router.post(Routes.App.CallPathAlertsListSubmit, requireOpsGenieAPIKey, cAlert.listAlertsSubmit);
router.post(Routes.App.CallPathAlertCreate, requireOpsGenieAPIKey, cAlert.createAlertSubmit);
router.post(Routes.App.CallPathNoteToAlertSubmit, requireOpsGenieAPIKey, cAlert.addNoteToAlertSubmit);
router.post(Routes.App.CallPathNoteToAlertAction, requireOpsGenieAPIKey, cAlert.addNoteToAlertModal);
router.post(Routes.App.CallPathAlertCloseSubmit, requireOpsGenieAPIKey, cAlert.closeAlertSubmit);
router.post(Routes.App.CallPathAlertCloseAction, requireOpsGenieAPIKey, cAlert.closeAlertModal);
router.post(Routes.App.CallPathAlertAcknowledgedSubmit, requireOpsGenieAPIKey, cAlert.ackAlertSubmit);
router.post(Routes.App.CallPathAlertAcknowledgedAction, requireOpsGenieAPIKey, cAlert.ackAlertModal);
router.post(Routes.App.CallPathAlertUnacknowledge, requireOpsGenieAPIKey, cAlert.unackAlertSubmit);
router.post(Routes.App.CallPathAlertUnacknowledgeAction, requireOpsGenieAPIKey, cAlert.unackAlertModal);
router.post(Routes.App.CallPathSnoozeAlert, requireOpsGenieAPIKey, cAlert.snoozeAlertSubmit);
router.post(Routes.App.CallPathSnoozeAlertAction, requireOpsGenieAPIKey, cAlert.snoozeAlertModal);
router.post(Routes.App.CallPathAssignAlertSubmit, requireOpsGenieAPIKey, cAlert.assignAlertSubmit);
router.post(Routes.App.CallPathAssignAlertAction, requireOpsGenieAPIKey, cAlert.assignAlertModal);
router.post(Routes.App.CallPathTakeOwnershipAlertSubmit, requireOpsGenieAPIKey, cAlert.takeOwnershipAlertSubmit);
router.post(Routes.App.CallPathUpdatePriorityAlertSubmit, requireOpsGenieAPIKey, cAlert.priorityAlertSubmit);
router.post(Routes.App.CallPathAlertOtherActions, requireOpsGenieAPIKey, cAlert.otherActionsAlert);

router.post(Routes.App.CallPathIncomingWebhookPath, cWebhook.incomingWebhook);

const staticRouter = express.Router();
staticRouter.use(express.static('static'));
router.use('/static', staticRouter);

export default router;
