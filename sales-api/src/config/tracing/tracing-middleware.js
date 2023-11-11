import { v4 as uuidv4 } from 'uuid';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export function tracingMiddleware(req, res, next) {
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