"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = void 0;
const express_1 = require("express");
const order_controller_1 = __importDefault(require("../controller/order-controller"));
exports.orderRouter = (0, express_1.Router)();
exports.orderRouter.post('/api/orders', order_controller_1.default.createOrder);
exports.orderRouter.get('/api/orders/:id', order_controller_1.default.findById);
exports.orderRouter.get('/api/orders/product/:productId', order_controller_1.default.findByProductId);
exports.orderRouter.get('/api/orders', order_controller_1.default.findAll);
