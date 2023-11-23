import { singleton } from "tsyringe";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../../../config/constants/secrets";

@singleton()
export class JwtService {
  sign(payload: string | object | Buffer): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
  }
}