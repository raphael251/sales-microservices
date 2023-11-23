import { Request, Response, Router } from 'express';
import { UserController } from '../controller/user-controller'
import { checkToken } from '../../../config/auth/check-token'
import { container } from 'tsyringe';

const userController = container.resolve(UserController)

const router = Router();

router.post('/auth', (req: Request, res: Response) => userController.getAccessToken(req, res))
router.use(checkToken);
router.get('/profile', (req: Request, res: Response) => userController.findByEmail(req, res))

export default router;