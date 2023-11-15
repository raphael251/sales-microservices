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
const httpStatus_1 = require("../../../config/constants/httpStatus");
const product_stock_update_sender_1 = require("../../products/rabbitmq/product-stock-update-sender");
const order_repository_1 = __importDefault(require("../repository/order-repository"));
const order_exception_1 = require("../exception/order-exception");
const order_status_1 = require("../status/order-status");
const product_client_1 = __importDefault(require("../../products/client/product-client"));
const tracing_log_util_1 = __importDefault(require("../../../config/tracing/tracing-log-util"));
const utils_1 = require("../../../config/tracing/utils");
class OrderService {
    createOrder(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { transactionId, serviceId } = (0, utils_1.extractTracingFieldsFromHeaders)(req.headers);
                tracing_log_util_1.default.receivingRequest('POST', 'createOrder', req.body, transactionId, serviceId);
                const { body: orderData, authUser } = req;
                const { authorization } = req.headers;
                this.validateOrderData(orderData);
                const order = {
                    status: order_status_1.ORDER_STATUS.PENDING,
                    user: authUser,
                    products: orderData.products,
                    transactionId,
                    serviceId
                };
                yield this.validateProductStock(orderData.products, authorization, transactionId, serviceId);
                const createdOrder = yield order_repository_1.default.save(order);
                this.sendMessage(createdOrder, transactionId, serviceId);
                const response = {
                    status: httpStatus_1.HTTP_STATUS.SUCCESS,
                    createdOrder
                };
                tracing_log_util_1.default.respondingRequest('POST', 'createOrder', response, transactionId, serviceId);
                return response;
            }
            catch (err) {
                if (err instanceof order_exception_1.OrderException) {
                    return {
                        status: err.status,
                        message: err.message
                    };
                }
                console.error(`error on order service ${this.createOrder.name}`, err);
                return {
                    status: httpStatus_1.HTTP_STATUS.INTERNAL_SERVER_ERROR,
                    message: 'internal server error'
                };
            }
        });
    }
    updateOrder(orderMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const order = this.parseOrderFromMessage(orderMessage);
                tracing_log_util_1.default.receivingRequest('message', 'updateOrder', order, order.transactionId, order.serviceId);
                if (order.salesId && order.salesStatus) {
                    const existingOrder = yield order_repository_1.default.findById(order.salesId);
                    if (!existingOrder)
                        throw new Error('could not find the existing order.');
                    if (order.salesStatus && order.salesStatus !== existingOrder.status) {
                        existingOrder.status = order.salesStatus;
                        yield order_repository_1.default.save(existingOrder);
                    }
                }
                else {
                    console.warn('the order message was not complete.');
                }
            }
            catch (err) {
                console.error('error updating order from a queue message.');
                if (err instanceof Error)
                    console.error(err.message);
            }
        });
    }
    parseOrderFromMessage(orderMessage) {
        try {
            return JSON.parse(orderMessage);
        }
        catch (err) {
            throw new Error('could not parse order message from queue.');
        }
    }
    validateOrderData(data) {
        if (!data || !data.products) {
            throw new order_exception_1.OrderException(httpStatus_1.HTTP_STATUS.BAD_REQUEST, 'the products must be informed.');
        }
    }
    validateProductStock(products, token, transactionId, serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const productsIsOutOfStock = yield product_client_1.default.checkProductStock(products, token, transactionId, serviceId);
            if (!productsIsOutOfStock) {
                throw new order_exception_1.OrderException(httpStatus_1.HTTP_STATUS.BAD_REQUEST, 'the stock is out for the products.');
            }
        });
    }
    sendMessage(order, transactionid, serviceid) {
        const message = {
            salesId: order.id,
            products: order.products,
            transactionid,
            serviceid
        };
        (0, product_stock_update_sender_1.sendMessageToProductStockUpdateQueue)(message);
    }
    findById(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { transactionId, serviceId } = (0, utils_1.extractTracingFieldsFromHeaders)(req.headers);
                tracing_log_util_1.default.receivingRequest('GET', 'order findById', req.body, transactionId, serviceId);
                const { id } = req.params;
                this.validateInformedId(id);
                const existingOrder = yield order_repository_1.default.findById(id);
                if (!existingOrder) {
                    throw new order_exception_1.OrderException(httpStatus_1.HTTP_STATUS.BAD_REQUEST, 'the order was not found.');
                }
                const response = {
                    status: httpStatus_1.HTTP_STATUS.SUCCESS,
                    existingOrder
                };
                tracing_log_util_1.default.respondingRequest('GET', 'order findById', response, transactionId, serviceId);
                return response;
            }
            catch (err) {
                if (err instanceof order_exception_1.OrderException) {
                    return {
                        status: err.status,
                        message: err.message
                    };
                }
                console.error(`error on order service ${this.findById.name}`, err);
                return {
                    status: httpStatus_1.HTTP_STATUS.INTERNAL_SERVER_ERROR,
                    message: 'internal server error'
                };
            }
        });
    }
    findAll(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { transactionId, serviceId } = (0, utils_1.extractTracingFieldsFromHeaders)(req.headers);
                tracing_log_util_1.default.receivingRequest('GET', 'order findAll', {}, transactionId, serviceId);
                const orders = yield order_repository_1.default.findAll();
                if (!orders) {
                    throw new order_exception_1.OrderException(httpStatus_1.HTTP_STATUS.BAD_REQUEST, 'no orders were found.');
                }
                const response = {
                    status: httpStatus_1.HTTP_STATUS.SUCCESS,
                    orders
                };
                tracing_log_util_1.default.respondingRequest('GET', 'order findAll', response, transactionId, serviceId);
                return response;
            }
            catch (err) {
                if (err instanceof order_exception_1.OrderException) {
                    return {
                        status: err.status,
                        message: err.message
                    };
                }
                console.error(`error on order service ${this.findById.name}`, err);
                return {
                    status: httpStatus_1.HTTP_STATUS.INTERNAL_SERVER_ERROR,
                    message: 'internal server error'
                };
            }
        });
    }
    findByProductId(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { transactionId, serviceId } = (0, utils_1.extractTracingFieldsFromHeaders)(req.headers);
                tracing_log_util_1.default.receivingRequest('GET', 'order findByProductId', req.params, transactionId, serviceId);
                const { productId } = req.params;
                this.validateInformedProductId(productId);
                const orders = yield order_repository_1.default.findByProductId(productId);
                if (!orders) {
                    throw new order_exception_1.OrderException(httpStatus_1.HTTP_STATUS.BAD_REQUEST, 'no orders were found.');
                }
                const response = {
                    status: httpStatus_1.HTTP_STATUS.SUCCESS,
                    salesIds: orders.map(order => order.id)
                };
                tracing_log_util_1.default.respondingRequest('GET', 'order findByProductId', response, transactionId, serviceId);
                return response;
            }
            catch (err) {
                if (err instanceof order_exception_1.OrderException) {
                    return {
                        status: err.status,
                        message: err.message
                    };
                }
                console.error(`error on order service ${this.findById.name}`, err);
                return {
                    status: httpStatus_1.HTTP_STATUS.INTERNAL_SERVER_ERROR,
                    message: 'internal server error'
                };
            }
        });
    }
    validateInformedId(id) {
        if (!id) {
            throw new order_exception_1.OrderException(httpStatus_1.HTTP_STATUS.BAD_REQUEST, 'The order ID must be informed.');
        }
    }
    validateInformedProductId(id) {
        if (!id) {
            throw new order_exception_1.OrderException(httpStatus_1.HTTP_STATUS.BAD_REQUEST, 'The order productId must be informed.');
        }
    }
}
exports.default = new OrderService();
