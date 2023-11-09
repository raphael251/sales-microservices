import { Router } from 'express';
import UserController from '../controller/user-controller.js'
import { checkToken } from '../../../config/auth/check-token.js'

const router = new Router();

router.post('/api/user/auth', UserController.getAccessToken)
router.use(checkToken);
router.get('/api/user/email/:email', UserController.findByEmail)

export default router;