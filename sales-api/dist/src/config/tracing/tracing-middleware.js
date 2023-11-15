"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tracingMiddleware = void 0;
const uuid_1 = require("uuid");
const httpStatus_1 = require("../constants/httpStatus");
function tracingMiddleware(req, res, next) {
    let { transactionid } = req.headers;
    if (!transactionid) {
        return res.status(httpStatus_1.HTTP_STATUS.BAD_REQUEST).json({
            status: httpStatus_1.HTTP_STATUS.BAD_REQUEST,
            message: 'the transactionid header is required.'
        });
    }
    req.headers.serviceId = (0, uuid_1.v4)();
    req.headers.transactionId = transactionid;
    return next();
}
exports.tracingMiddleware = tracingMiddleware;
