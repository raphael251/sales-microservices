import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import UserRepository from '../repository/user-repository.js';
import { HTTP_STATUS } from '../../../config/constants/httpStatus.js';
import UserException from '../exception/user-exception.js';
import { JWT_SECRET } from '../../../config/constants/secrets.js';
import TracingLogUtil from '../../../config/tracing/tracing-log-util.js';

class UserService {
  async findByEmail(req) {
    try {
      const { email } = req.params;

      this.validateRequestData(email);

      const user = await UserRepository.findByEmail(email);

      this.validateUserNotFound(user)
      this.validateAuthenticatedUser(user, req.authUser)

      return {
        status: HTTP_STATUS.SUCCESS,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }
    } catch (err) {
      return {
        status: err.status ? err.status : HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: err.message
      }
    }
  }

  validateRequestData(email) {
    if (!email) {
      throw new UserException(HTTP_STATUS.BAD_REQUEST, 'User email was not informed.');
    }
  }

  validateUserNotFound(user) {
    if (!user) {
      throw new UserException(HTTP_STATUS.BAD_REQUEST, 'User was not found.')
    }
  }

  validateAuthenticatedUser(user, authUser) {
    if (!authUser || user.id !== authUser.id) {
      throw new UserException(HTTP_STATUS.FORBIDDEN, 'You cannot see this user data.')
    }
  }

  async getAccessToken(req) {
    try {
      const { transactionId, serviceId } = req.headers;
      TracingLogUtil.receivingRequest('POST', 'login', req.body, transactionId, serviceId);

      const { email, password } = req.body;
  
      this.validateAccessTokenData(email, password);
     
      const user = await UserRepository.findByEmail(email);

      this.validateUserNotFound(user);
      await this.validatePassword(password, user.password);

      const authUser = { id: user.id, name: user.name, email: user.email };
      
      const accessToken = jwt.sign({ authUser }, JWT_SECRET, { expiresIn: '1d' })

      const response = {
        status: HTTP_STATUS.SUCCESS,
        accessToken
      }
      TracingLogUtil.respondingRequest('POST', 'login', response, transactionId, serviceId);
      return response;
    } catch (err) {
      return {
        status: err.status ? err.status : HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: err.message
      }
    }
  }

  validateAccessTokenData(email, password) {
    if (!email || !password) {
      throw new UserException(HTTP_STATUS.UNAUTHORIZED, 'Email and password must be informed.')
    }
  }

  async validatePassword(password, hashPassword) {
    if (!(await bcrypt.compare(password, hashPassword))) {
      throw new UserException(HTTP_STATUS.UNAUTHORIZED, 'Email or password incorrect.')
    }
  }
}

export default new UserService();