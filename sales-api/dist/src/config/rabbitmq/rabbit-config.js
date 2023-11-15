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
exports.connectRabbitMQ = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const queue_1 = require("./queue");
const secrets_1 = require("../constants/secrets");
const sales_confirmation_listener_1 = require("../../modules/sales/rabbitmq/sales-confirmation-listener");
function connectRabbitMQ() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield amqplib_1.default.connect(secrets_1.RABBIT_MQ_URL, { timeout: 180000 });
            console.info('start creating queues...');
            yield createQueue(connection, queue_1.RABBIT_QUEUES.PRODUCT_STOCK_UPDATE_QUEUE, queue_1.RABBIT_QUEUES.PRODUCT_STOCK_UPDATE_ROUTING_KEY, queue_1.RABBIT_QUEUES.PRODUCT_TOPIC);
            yield createQueue(connection, queue_1.RABBIT_QUEUES.SALES_CONFIRMATION_QUEUE, queue_1.RABBIT_QUEUES.SALES_CONFIRMATION_ROUTING_KEY, queue_1.RABBIT_QUEUES.PRODUCT_TOPIC);
            yield connection.close();
            (0, sales_confirmation_listener_1.listenToSalesConfirmationQueue)();
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.connectRabbitMQ = connectRabbitMQ;
function createQueue(connection, queue, routingKey, topic) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const channel = yield connection.createChannel();
            yield channel.assertExchange(topic, 'topic', { durable: true });
            yield channel.assertQueue(queue, { durable: true });
            yield channel.bindQueue(queue, topic, routingKey);
            console.info(`queue ${queue} and routingKey ${routingKey} created.`);
        }
        catch (error) {
            console.error(`there is an error binding the rabbitMQ routingKey ${routingKey} to the queue ${queue}`, error);
        }
    });
}
