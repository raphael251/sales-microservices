import { singleton } from "tsyringe";
import bcrypt from 'bcrypt';

@singleton()
export class HashService {
  async isTheValuesEqual(value: string, hashedValue: string): Promise<boolean> {
    return bcrypt.compare(value, hashedValue)
  }
}