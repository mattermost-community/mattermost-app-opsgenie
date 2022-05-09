import express, {Router} from 'express';
import {Routes} from '../constant';
import * as cManifest from './manifest';
import * as cBindings from './bindings';

const router: Router = express.Router();

router.get(Routes.App.ManifestPath, cManifest.getManifest);
router.post(Routes.App.BindingsPath, cBindings.getBindings);

router.use(express.static('static'));

export default router;
