import { UserRepository } from '../repository/user-repository';
import { UserException } from '../exception/user-exception';
import { HTTP_STATUS } from '../../../config/constants/httpStatus';
import { TracingLogUtil } from '../../../config/tracing/tracing-log-util';
import { AuthUser } from '../../../config/auth/auth-user';
import { UserResponseDTO } from '../dto/user-response-dto';
import { AccessTokenResponseDTO } from '../dto/access-token-response-dto';
import { singleton } from 'tsyringe'
import { HashService } from '../../auth/service/hash-service';
import { JwtService } from '../../auth/service/jwt-service';

@singleton()
export class UserService {
  constructor(
    private userRepository: UserRepository, 
    private hashService: HashService,
    private jwtService: JwtService
  ) {}

  async getAccessToken(email: string, password: string, transactionId: string, serviceId: string): Promise<AccessTokenResponseDTO> {
    TracingLogUtil.receivingRequest('POST', 'login', { email, password }, transactionId, serviceId);

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserException(HTTP_STATUS.UNAUTHORIZED, 'Email or password incorrect.')
    }

    if (!(await this.hashService.isTheValuesEqual(password, user.dataValues.password))) {
      throw new UserException(HTTP_STATUS.UNAUTHORIZED, 'Email or password incorrect.')
    }

    const authUser: AuthUser = { 
      id: user.id, 
      name: user.name, 
      email: user.email
    };
    
    const accessToken = this.jwtService.sign({ authUser });

    TracingLogUtil.respondingRequest('POST', 'login', { accessToken }, transactionId, serviceId);

    return { accessToken };
  }

  async findByEmail(email: string): Promise<UserResponseDTO> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserException(HTTP_STATUS.BAD_REQUEST, 'User was not found.')
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email
    }
  }
}