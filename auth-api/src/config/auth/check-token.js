import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import { jwtSecret } from '../constants/secrets.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import AuthException from './auth-exception.js';

const emptySpace = ' ';

export default async (req, res, next) => {
  try {
    console.group()
    const { authorization } = req.headers;

    if (!authorization) {
      throw new AuthException(HTTP_STATUS.UNAUTHORIZED, 'Access token was not informed.');
    }

    let accessToken = authorization;
    if (accessToken.includes(emptySpace)) {
      accessToken = accessToken.split(emptySpace)[1];
    }

    const decoded = await promisify(jwt.verify)(accessToken, jwtSecret);

    req.authUser = decoded.authUser;

    return next();
  } catch (err) {
    const status = err.status ? err.status : HTTP_STATUS.INTERNAL_SERVER_ERROR
    return res.status(status).json({
      status,
      message: err.message
    })
  }
}