import amqp from 'amqplib/callback_api.js';
import { RABBIT_QUEUES } from './queue.js';
import { RABBIT_MQ_URL } from '../constants/secrets.js';

const HALF_SECOND = 500;

export async function connectRabbitMQ() {
  amqp.connect(RABBIT_MQ_URL, (err, connection) => {
    if (err) throw err;
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
  });

  function createQueue(connection, queue, routingKey, topic) {
    connection.createChannel((err, channel) => {
      if (err) throw err;
      channel.assertExchange(topic, 'topic', { durable: true });
      channel.assertQueue(queue, { durable: true });
      channel.bindQueue(queue, topic, routingKey);
    })
  }
}