import { v4 as uuidv4 } from 'uuid';
import { HTTP_STATUS } from '../constants/httpStatus';
import { NextFunction, Request, Response } from 'express';

export function tracingMiddleware(req: Request, res: Response, next: NextFunction) {
  let { transactionid } = req.headers;
  if (!transactionid) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      status: HTTP_STATUS.BAD_REQUEST,
      message: 'the transactionid header is required.'
    })
  }

  req.headers.serviceId = uuidv4();
  req.headers.transactionId = transactionid
  return next();
}