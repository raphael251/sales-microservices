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
exports.sendMessageToProductStockUpdateQueue = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const secrets_1 = require("../../../config/constants/secrets");
const queue_1 = require("../../../config/rabbitmq/queue");
function sendMessageToProductStockUpdateQueue(message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield amqplib_1.default.connect(secrets_1.RABBIT_MQ_URL);
            const channel = yield connection.createChannel();
            const stringifiedMessage = JSON.stringify(message);
            console.info(`sending message to product udpate stock: ${JSON.stringify(message)}`);
            channel.publish(queue_1.RABBIT_QUEUES.PRODUCT_TOPIC, queue_1.RABBIT_QUEUES.PRODUCT_STOCK_UPDATE_ROUTING_KEY, Buffer.from(stringifiedMessage));
            console.info('message sent.');
        }
        catch (error) {
            console.error(`Error sending message to the product stock update queue.`);
        }
    });
}
exports.sendMessageToProductStockUpdateQueue = sendMessageToProductStockUpdateQueue;
