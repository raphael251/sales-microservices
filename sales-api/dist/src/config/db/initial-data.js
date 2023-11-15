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
exports.createInitialData = void 0;
const order_model_1 = require("../../modules/sales/model/order-model");
function createInitialData() {
    return __awaiter(this, void 0, void 0, function* () {
        yield order_model_1.Order.collection.drop();
        yield order_model_1.Order.insertMany([
            {
                products: [
                    {
                        productId: 1001,
                        quantity: 2
                    },
                    {
                        productId: 1002,
                        quantity: 1
                    },
                    {
                        productId: 1003,
                        quantity: 2
                    }
                ],
                user: {
                    id: 'user-id-1',
                    name: 'User Test',
                    email: 'testeuser@gmail.com'
                },
                status: 'APPROVED',
                transactionId: '8dfdc70b-8acc-4423-a9e1-75c0640923d',
                serviceId: 'e1e52cee-0263-4465-bd6c-b0e396ededd'
            },
            {
                products: [
                    {
                        productId: 1001,
                        quantity: 4
                    },
                    {
                        productId: 1003,
                        quantity: 3
                    },
                ],
                user: {
                    id: 'user-id-2',
                    name: 'User Test 2',
                    email: 'testeuser2@gmail.com'
                },
                status: 'REJECTED',
                transactionId: 'e1e52cee-0263-4465-bd6c-b0e396ededd1',
                serviceId: '8dfdc70b-8acc-4423-a9e1-75c0640923d4'
            }
        ]);
        const orders = yield order_model_1.Order.find({});
        console.info(`Info data ${JSON.stringify(orders, undefined, 2)}`);
    });
}
exports.createInitialData = createInitialData;
