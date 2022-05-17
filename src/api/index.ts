import express, {Router} from 'express';
import {Routes} from '../constant';
import * as cManifest from './manifest';
import * as cBindings from './bindings';
import * as cInstall from './install';
import * as cHelp from './help';
import * as cAlert from './alert';

const router: Router = express.Router();

router.get(Routes.App.ManifestPath, cManifest.getManifest);
router.post(Routes.App.BindingsPath, cBindings.getBindings);
router.post(Routes.App.InstallPath, cInstall.getInstall);

router.post(`${Routes.App.BindingPathHelp}`, cHelp.getHelp);

router.post(`${Routes.App.CallPathAlertCreate}/form`, cAlert.createAlert);
router.post(`${Routes.App.CallPathNoteToAlertCreate}/submit`, cAlert.createNoteToAlert);
router.post(`${Routes.App.CallPathSnoozeAlertCreate}/submit`, cAlert.createSnoozeAlert);
router.post(`${Routes.App.CallPathAssignOwnerAlert}/submit`, cAlert.assignOwnerToAlert);

const staticRouter = express.Router();
staticRouter.use(express.static('static'));
router.use('/static', staticRouter);

export default router;
