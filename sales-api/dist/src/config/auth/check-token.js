"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secrets_1 = require("../constants/secrets");
const httpStatus_1 = require("../constants/httpStatus");
const auth_exception_1 = require("./auth-exception");
const EMPTY_SPACE = ' ';
function checkToken(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { authorization } = req.headers;
            if (!authorization) {
                throw new auth_exception_1.AuthException(httpStatus_1.HTTP_STATUS.UNAUTHORIZED, 'Invalid access token.');
            }
            let accessToken = authorization;
            if (accessToken.includes(EMPTY_SPACE)) {
                accessToken = accessToken.split(EMPTY_SPACE)[1];
            }
            const decoded = yield verifyJwt(accessToken, secrets_1.JWT_SECRET);
            const authUser = extractAuthUserFromDecodedJwt(decoded);
            req.authUser = authUser;
            return next();
        }
        catch (err) {
            if (err instanceof auth_exception_1.AuthException) {
                return res.status(err.status).json({
                    status: err.status,
                    message: err.message
                });
            }
            console.error(err);
            return res.status(httpStatus_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                status: httpStatus_1.HTTP_STATUS.INTERNAL_SERVER_ERROR,
                message: 'internal server error'
            });
        }
    });
}
exports.checkToken = checkToken;
// creating the promisified version of verify because the promisify function from util is not returning the correct type.
function verifyJwt(token, secret) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, secret);
                return resolve(decoded);
            }
            catch (error) {
                return reject(error);
            }
        });
    });
}
function extractAuthUserFromDecodedJwt(decoded) {
    if (typeof decoded !== 'string' && decoded.authUser && decoded.authUser.id && decoded.authUser.name && decoded.authUser.email) {
        return {
            id: decoded.authUser.id,
            name: decoded.authUser.name,
            email: decoded.authUser.email
        };
    }
    throw new auth_exception_1.AuthException(httpStatus_1.HTTP_STATUS.UNAUTHORIZED, 'Invalid access token.');
}
