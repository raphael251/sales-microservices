import { AuthUser } from '../../../config/auth/auth-user';
import { HTTP_STATUS } from '../../../config/constants/httpStatus';
import { UserException } from '../exception/user-exception';
import UserService from '../service/user-service';
import { Request, Response } from 'express';

class UserController {
  async getAccessToken(req: Request, res: Response) {
    const accessToken = await UserService.getAccessToken(req);
    return res.status(accessToken.status).json(accessToken);
  }

  async findByEmail(req: Request, res: Response) {
    const { email } = req.params;

    if (!email) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: HTTP_STATUS.BAD_REQUEST,
        message: 'User email was not informed.'
      })
    }

    const authUser = req.authUser;

    if (!authUser) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: 'internal server error'
      })
    }

    const user = await UserService.findByEmail(email, authUser);
    return res.status(user.status).json(user);
  }
}

export default new UserController();