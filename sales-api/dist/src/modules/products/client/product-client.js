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
const axios_1 = __importDefault(require("axios"));
const secrets_1 = require("../../../config/constants/secrets");
const tracing_log_util_1 = __importDefault(require("../../../config/tracing/tracing-log-util"));
class ProductClient {
    checkProductStock(products, token, transactionId, serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                tracing_log_util_1.default.sendingRequest('POST', 'checkProductStock', products, transactionId, serviceId);
                yield axios_1.default.post(`${secrets_1.PRODUCT_API_URL}/check-stock`, { products }, {
                    headers: {
                        Authorization: token,
                        transactionId
                    }
                });
                tracing_log_util_1.default.sendingRequestSuccess('POST', 'checkProductStock', products, transactionId, serviceId);
                return true;
            }
            catch (err) {
                tracing_log_util_1.default.sendingRequestFail('POST', 'checkProductStock', products, transactionId, serviceId);
                return false;
            }
        });
    }
}
exports.default = new ProductClient();
