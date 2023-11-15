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
Object.defineProperty(exports, "__esModule", { value: true });
const order_model_1 = require("../model/order-model");
class OrderRepository {
    save(order) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield order_model_1.Order.create(order);
            }
            catch (err) {
                console.error(err);
                return null;
            }
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield order_model_1.Order.findById(id);
            }
            catch (err) {
                console.error(err);
                return null;
            }
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield order_model_1.Order.find({});
            }
            catch (err) {
                console.error(err);
                return null;
            }
        });
    }
    findByProductId(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield order_model_1.Order.find({ 'products.productId': Number(productId) });
            }
            catch (err) {
                console.error(err);
                return null;
            }
        });
    }
}
exports.default = new OrderRepository();
