import { singleton } from 'tsyringe';
import User from '../model/user-model'

@singleton()
export class UserRepository {
  async create(name: string, email: string, password: string): Promise<User | null> {
    try {
      return await User.create({ name, email, password })
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await User.findOne({ where: { id } });
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await User.findOne({ where: { email } });
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}