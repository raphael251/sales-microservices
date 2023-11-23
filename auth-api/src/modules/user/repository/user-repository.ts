import { singleton } from 'tsyringe';
import User from '../model/user-model'

@singleton()
export class UserRepository {
  async findById(id: string): Promise<User | null> {
    try {
      return await User.findOne({ where: { id } });
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await User.findOne({ where: { email } });
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}