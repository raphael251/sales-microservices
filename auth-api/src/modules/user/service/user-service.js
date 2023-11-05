import UserRepository from '../repository/user-repository.js'
import { HTTP_STATUS } from '../../../config/constants/httpStatus.js';
import UserException from '../exception/user-exception.js';

class UserService {
  async findByEmail(req) {
    try {
      const { email } = req.params;

      this.validateRequestData(email);

      const user = await UserRepository.findByEmail(email);

      this.validateUserNotFound(user)

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
}

export default new UserService();