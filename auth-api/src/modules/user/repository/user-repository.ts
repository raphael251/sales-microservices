import User from '../model/user-model'

class UserRepository {
  async findById(id: string) {
    try {
      return await User.findOne({ where: { id } });
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async findByEmail(email: string) {
    try {
      return await User.findOne({ where: { email } });
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}

export default new UserRepository();