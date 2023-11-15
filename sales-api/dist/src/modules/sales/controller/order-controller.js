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
const order_service_1 = __importDefault(require("../service/order-service"));
class OrderController {
    createOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield order_service_1.default.createOrder(req);
            return res.status(order.status).json(order);
        });
    }
    findById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield order_service_1.default.findById(req);
            return res.status(order.status).json(order);
        });
    }
    findAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield order_service_1.default.findAll(req);
            return res.status(order.status).json(order);
        });
    }
    findByProductId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield order_service_1.default.findByProductId(req);
            return res.status(order.status).json(order);
        });
    }
}
exports.default = new OrderController();
