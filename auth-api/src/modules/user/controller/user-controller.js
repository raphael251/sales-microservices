import UserService from '../service/user-service.js'

class UserController {
  async getAccessToken(req, res) {
    const accessToken = await UserService.getAccessToken(req);
    return res.status(accessToken.status).json(accessToken);
  }

  async findByEmail(req, res) {
    const user = await UserService.findByEmail(req);
    return res.status(user.status).json(user);
  } 
}

export default new UserController();