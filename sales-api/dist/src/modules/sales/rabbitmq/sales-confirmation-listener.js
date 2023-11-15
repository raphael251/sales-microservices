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
exports.listenToSalesConfirmationQueue = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const secrets_1 = require("../../../config/constants/secrets");
const queue_1 = require("../../../config/rabbitmq/queue");
const order_service_js_1 = __importDefault(require("../service/order-service.js"));
function listenToSalesConfirmationQueue() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield amqplib_1.default.connect(secrets_1.RABBIT_MQ_URL);
            console.info('listening to sales confirmation queue...');
            const channel = yield connection.createChannel();
            yield channel.consume(queue_1.RABBIT_QUEUES.SALES_CONFIRMATION_QUEUE, (message) => {
                if (!message)
                    throw new Error('Error receiving message from the sales confirmation queue');
                console.info(`receiving message from queue: ${message.content.toString()}`);
                order_service_js_1.default.updateOrder(message.content.toString());
            }, { noAck: true });
        }
        catch (error) {
            console.error('Error listening to the sales confirmation queue.', error);
        }
    });
}
exports.listenToSalesConfirmationQueue = listenToSalesConfirmationQueue;
