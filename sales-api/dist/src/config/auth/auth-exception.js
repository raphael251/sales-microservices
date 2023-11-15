"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthException = void 0;
class AuthException extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.message = message;
        this.name = this.constructor.name;
        Error.captureStackTrace(this.constructor);
    }
}
exports.AuthException = AuthException;
