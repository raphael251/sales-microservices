import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../constants/secrets';
import { HTTP_STATUS } from '../constants/httpStatus';
import { AuthException } from './auth-exception';
import { NextFunction, Request, Response } from 'express';
import { AuthUser } from './auth-user';

const EMPTY_SPACE = ' ';

export async function checkToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new AuthException(HTTP_STATUS.UNAUTHORIZED, 'Invalid access token.');
    }

    let accessToken = authorization;
    if (accessToken.includes(EMPTY_SPACE)) {
      accessToken = accessToken.split(EMPTY_SPACE)[1];
    }

    const decoded = await verifyJwt(accessToken, JWT_SECRET);

    const authUser = extractAuthUserFromDecodedJwt(decoded);

    req.authUser = authUser;

    return next();
  } catch (err) {
    if (err instanceof AuthException) {
      return res.status(err.status).json({
        status: err.status,
        message: err.message
      })
    }

    console.error(err)

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: 'internal server error'
    })
  }
}

// creating the promisified version of verify because the promisify function from util is not returning the correct type.
async function verifyJwt(token: string, secret: string): Promise<string | jwt.JwtPayload> {
  return new Promise<string | jwt.JwtPayload>((resolve, reject) => {
    try {
      const decoded = jwt.verify(token, secret);
      return resolve(decoded);
    } catch (error) {
      return reject(error);
    }
  })
}

function extractAuthUserFromDecodedJwt(decoded: string | jwt.JwtPayload): AuthUser {
  if (typeof decoded !== 'string' && decoded.authUser && decoded.authUser.id && decoded.authUser.name && decoded.authUser.email) {
    return { 
      id: decoded.authUser.id, 
      name: decoded.authUser.name, 
      email: decoded.authUser.email
    };
  }

  throw new AuthException(HTTP_STATUS.UNAUTHORIZED, 'Invalid access token.');
}