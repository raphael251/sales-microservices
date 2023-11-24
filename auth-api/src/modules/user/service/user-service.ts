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
import { CreateUserRequestDTO } from '../dto/create-user-request-dto';
import { UnexpectedException } from '../exception/unexpected-exception';

@singleton()
export class UserService {
  constructor(
    private userRepository: UserRepository, 
    private hashService: HashService,
    private jwtService: JwtService
  ) {}

  async create(userToCreate: CreateUserRequestDTO): Promise<UserResponseDTO> {
    const existingUser = await this.userRepository.findByEmail(userToCreate.email)

    if (!!existingUser) throw new UserException(HTTP_STATUS.BAD_REQUEST, 'There is already a user using this email address.')

    const hashedPassword = await this.hashService.hash(userToCreate.password)

    const user = await this.userRepository.create(userToCreate.name, userToCreate.email, hashedPassword)

    if (!user) throw new UnexpectedException('Could not create user')

    return {
      id: user.id,
      name: user.name,
      email: user.email
    };
  }

  async getAccessToken(email: string, password: string, transactionId: string, serviceId: string): Promise<AccessTokenResponseDTO> {
    TracingLogUtil.receivingRequest('POST', 'login', { email, password }, transactionId, serviceId);

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserException(HTTP_STATUS.UNAUTHORIZED, 'Email or password incorrect.')
    }

    if (!(await this.hashService.isTheValuesEqual(password, user.password))) {
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