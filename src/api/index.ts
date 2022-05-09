import express, {Router} from 'express';
import {Routes} from '../constant';
import * as cManifest from './manifest';

const router: Router = express.Router();

router.get(Routes.App.ManifestPath, cManifest.getManifest);


router.use(express.static('static'));

export default router;
