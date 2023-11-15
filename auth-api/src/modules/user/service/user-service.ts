import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { Model } from 'sequelize';

import UserRepository from '../repository/user-repository';
import { UserException } from '../exception/user-exception';
import { JWT_SECRET } from '../../../config/constants/secrets';
import { HTTP_STATUS } from '../../../config/constants/httpStatus';
import { TracingLogUtil } from '../../../config/tracing/tracing-log-util';
import User from '../model/user-model';
import { extractTracingFieldsFromHeaders } from '../../../config/tracing/utils';
import { AuthUser } from '../../../config/auth/auth-user';

class UserService {
  async findByEmail(email: string, authUser: AuthUser) {
    try {
      const user = await UserRepository.findByEmail(email);

      if (!user) {
        throw new UserException(HTTP_STATUS.BAD_REQUEST, 'User was not found.')
      }
      
      this.validateAuthenticatedUser(user, authUser);

      return {
        status: HTTP_STATUS.SUCCESS,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }
    } catch (err) {
      if (err instanceof UserException) {
        return {
          status: err.status,
          message: err.message
        }
      }

      return {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: 'internal server error'
      }
    }
  }

  validateUserNotFound(user: Model | null) {
    if (!user) {
      throw new UserException(HTTP_STATUS.BAD_REQUEST, 'User was not found.')
    }
  }

  validateAuthenticatedUser(user: User | null, authUser: AuthUser) {
    if (!authUser || !user || user.id !== authUser.id) {
      throw new UserException(HTTP_STATUS.FORBIDDEN, 'You cannot see this user data.')
    }
  }

  async getAccessToken(req: Request) {
    try {
      const { transactionId, serviceId } = extractTracingFieldsFromHeaders(req.headers);

      TracingLogUtil.receivingRequest('POST', 'login', req.body, transactionId, serviceId);

      const { email, password } = req.body;
  
      this.validateAccessTokenData(email, password);
     
      const user = await UserRepository.findByEmail(email);

      if (!user) {
        throw new UserException(HTTP_STATUS.BAD_REQUEST, 'User was not found.')
      }

      this.validateUserNotFound(user);
      await this.validatePassword(password, user.dataValues.password);

      const authUser: AuthUser = { 
        id: user.id, 
        name: user.name, 
        email: user.email
      };
      
      const accessToken = jwt.sign({ authUser }, JWT_SECRET, { expiresIn: '1d' });

      const response = {
        status: HTTP_STATUS.SUCCESS,
        accessToken
      };

      TracingLogUtil.respondingRequest('POST', 'login', response, transactionId, serviceId);
      return response;
    } catch (err) {
      if (err instanceof UserException) {
        return {
          status: err.status,
          message: err.message
        };
      }

      console.error(`error on user service ${this.getAccessToken.name}`, err);

      return {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: 'internal server error'
      };
    }
  }

  validateAccessTokenData(email: string, password: string) {
    if (!email || !password) {
      throw new UserException(HTTP_STATUS.UNAUTHORIZED, 'Email and password must be informed.')
    }
  }

  async validatePassword(password: string, hashPassword: string) {
    if (!(await bcrypt.compare(password, hashPassword))) {
      throw new UserException(HTTP_STATUS.UNAUTHORIZED, 'Email or password incorrect.')
    }
  }
}

export default new UserService();