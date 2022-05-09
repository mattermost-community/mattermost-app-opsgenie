import express, {Router} from 'express';
import {Routes} from '../constant';
import * as cManifest from './manifest';
import * as cBindings from './bindings';
import * as cHelp from './help';

const router: Router = express.Router();

router.get(Routes.App.ManifestPath, cManifest.getManifest);
router.post(Routes.App.BindingsPath, cBindings.getBindings);

router.post(`${Routes.App.BindingPathHelp}/submit`, cHelp.getHelp);


router.use(express.static('static'));

export default router;
