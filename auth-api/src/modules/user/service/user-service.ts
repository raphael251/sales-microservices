import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import UserRepository from '../repository/user-repository';
import { UserException } from '../exception/user-exception';
import { JWT_SECRET } from '../../../config/constants/secrets';
import { HTTP_STATUS } from '../../../config/constants/httpStatus';
import { TracingLogUtil } from '../../../config/tracing/tracing-log-util';
import { extractTracingFieldsFromHeaders } from '../../../config/tracing/utils';
import { AuthUser } from '../../../config/auth/auth-user';
import { UserResponseDTO } from '../dto/user-response-dto';
import { AccessTokenResponseDTO } from '../dto/access-token-response-dto';

class UserService {
  async findByEmail(email: string, authUser: AuthUser): Promise<UserResponseDTO> {
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      throw new UserException(HTTP_STATUS.BAD_REQUEST, 'User was not found.')
    }
    
    if (user.id !== authUser.id) {
      throw new UserException(HTTP_STATUS.FORBIDDEN, 'You cannot see this user data.')
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email
    }
  }

  async getAccessToken(email: string, password: string, transactionId: string, serviceId: string): Promise<AccessTokenResponseDTO> {
    TracingLogUtil.receivingRequest('POST', 'login', { email, password }, transactionId, serviceId);

    const user = await UserRepository.findByEmail(email);

    if (!user) {
      throw new UserException(HTTP_STATUS.BAD_REQUEST, 'User was not found.')
    }

    await this.validatePassword(password, user.dataValues.password);

    const authUser: AuthUser = { 
      id: user.id, 
      name: user.name, 
      email: user.email
    };
    
    const accessToken = jwt.sign({ authUser }, JWT_SECRET, { expiresIn: '1d' });

    TracingLogUtil.respondingRequest('POST', 'login', { accessToken }, transactionId, serviceId);

    return { accessToken };
  }

  async validatePassword(password: string, hashPassword: string) {
    if (!(await bcrypt.compare(password, hashPassword))) {
      throw new UserException(HTTP_STATUS.UNAUTHORIZED, 'Email or password incorrect.')
    }
  }
}

export default new UserService();