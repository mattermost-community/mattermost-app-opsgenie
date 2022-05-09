import express, {Router} from 'express';

const router: Router = express.Router();

router.use(express.static('static'));

export default router;
