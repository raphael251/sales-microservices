"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderException = void 0;
class OrderException extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.message = message;
        this.name = this.constructor.name;
        Error.captureStackTrace(this.constructor);
    }
}
exports.OrderException = OrderException;
