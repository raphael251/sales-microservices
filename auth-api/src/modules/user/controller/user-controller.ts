import { singleton } from 'tsyringe';
import { HTTP_STATUS } from '../../../config/constants/httpStatus';
import { httpResponsesHelper } from '../../../config/express/helpers/http-responses';
import { extractTracingFieldsFromHeaders } from '../../../config/tracing/utils';
import { UnexpectedException } from '../exception/unexpected-exception';
import { UserException } from '../exception/user-exception';
import { UserService } from '../service/user-service';
import { Request, Response } from 'express';

@singleton()
export class UserController {
  constructor(private userService: UserService) {}

  async getAccessToken(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new UserException(HTTP_STATUS.UNAUTHORIZED, 'Email and password must be informed.')
      }
      
      const { transactionId, serviceId } = extractTracingFieldsFromHeaders(req.headers);

      const accessToken = await this.userService.getAccessToken(email, password, transactionId, serviceId);

      return res.status(HTTP_STATUS.SUCCESS).json(accessToken);
    } catch (error) {
      if (error instanceof UserException) {
        return httpResponsesHelper.badRequest(res, { message: error.message })
      }
      
      console.error('error getting access token', error);

      if (error instanceof UnexpectedException) {
        return httpResponsesHelper.internalServerError(res)
      }

      return httpResponsesHelper.internalServerError(res);
    }
  }

  async findByEmail(req: Request, res: Response) {
    try {
      const authUser = req.authUser;
  
      if (!authUser) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: 'internal server error'
        })
      }
  
      const user = await this.userService.findByEmail(authUser.email);

      return res.status(HTTP_STATUS.SUCCESS).json(user);
    } catch (error) {
      if (error instanceof UserException) {
        return httpResponsesHelper.badRequest(res, { message: error.message })
      }
      
      console.error('error finding user by email', error);

      if (error instanceof UnexpectedException) {
        return httpResponsesHelper.internalServerError(res)
      }

      return httpResponsesHelper.internalServerError(res);
    }
  }
}