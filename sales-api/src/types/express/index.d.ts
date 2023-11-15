import { Express } from 'express-serve-static-core'
import { AuthUser } from '../../config/auth/auth-user';

export {};

// using declaration merging to add a custom type to add the authenticated user to the express Request object
declare global {
  namespace Express {
    export interface Request {
      authUser?: AuthUser;
    }
  }
}