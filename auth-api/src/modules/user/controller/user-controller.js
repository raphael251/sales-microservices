import UserService from '../service/user-service.js'

class UserController {
  async findByEmail(req, res) {
    const user = await UserService.findByEmail(req);
    return res.status(user.status).json(user);
  } 
}

export default new UserController();