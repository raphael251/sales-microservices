import amqp from 'amqplib/callback_api.js';
import { RABBIT_QUEUES } from './queue.js';
import { RABBIT_MQ_URL } from '../constants/secrets.js';
import { listenToSalesConfirmationQueue } from '../../modules/sales/rabbitmq/sales-confirmation-listener.js';

const HALF_SECOND = 500;

export async function connectRabbitMQ() {
  amqp.connect(RABBIT_MQ_URL, { timeout: 180000 }, (err, connection) => {
    if (err) throw err;
    console.info('start creating queues...')
    createQueue(
      connection, 
      RABBIT_QUEUES.PRODUCT_STOCK_UPDATE_QUEUE,
      RABBIT_QUEUES.PRODUCT_STOCK_UPDATE_ROUTING_KEY,
      RABBIT_QUEUES.PRODUCT_TOPIC
    );
    createQueue(
      connection, 
      RABBIT_QUEUES.SALES_CONFIRMATION_QUEUE,
      RABBIT_QUEUES.SALES_CONFIRMATION_ROUTING_KEY,
      RABBIT_QUEUES.PRODUCT_TOPIC
    );
    setTimeout(() => {
      connection.close();
    }, HALF_SECOND);
    listenToSalesConfirmationQueue();
  });
}

function createQueue(connection, queue, routingKey, topic) {
  connection.createChannel((err, channel) => {
    if (err) throw err;
    channel.assertExchange(topic, 'topic', { durable: true });
    channel.assertQueue(queue, { durable: true });
    channel.bindQueue(queue, topic, routingKey);
    console.info(`queue ${queue} and routingKey ${routingKey} created.`)
  })
}
