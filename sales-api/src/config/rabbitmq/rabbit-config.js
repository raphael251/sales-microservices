import amqp from 'amqplib/callback_api.js';
import { RABBIT_QUEUES } from './queue.js';
import { RABBIT_MQ_URL } from '../constants/secrets.js';

const HALF_SECOND = 500;
const HALF_MINUTE = 30000;
const CONTAINER_ENV = 'container';

export async function connectRabbitMQ() {
  if (process.env.NODE_ENV === CONTAINER_ENV) {
    console.info('Waiting for RabbitMQ to start...');
    setInterval(() => {
      connectRabbitMQAndCreateQueue();
    }, HALF_MINUTE)
  } else {
    connectRabbitMQAndCreateQueue();
  }
}

function connectRabbitMQAndCreateQueue() {
  amqp.connect(RABBIT_MQ_URL, (err, connection) => {
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
