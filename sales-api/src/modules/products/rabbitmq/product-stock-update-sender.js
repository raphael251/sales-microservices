import amqp from 'amqplib/callback_api.js';
import { RABBIT_MQ_URL } from '../../../config/constants/secrets.js';
import { RABBIT_QUEUES } from '../../../config/rabbitmq/queue.js';

export function sendMessageToProductStockUpdateQueue(message) {
  amqp.connect(RABBIT_MQ_URL, (err, connection) => {
    if (err) throw err;
    connection.createChannel((err, channel) => {
      if (err) throw err;
      const stringifiedMessage = JSON.stringify(message);
      console.info(`sending message to product udpate stock: ${message}`)
      channel.publish(
        RABBIT_QUEUES.PRODUCT_TOPIC,
        RABBIT_QUEUES.PRODUCT_STOCK_UPDATE_ROUTING_KEY,
        Buffer.from(stringifiedMessage),
        { noAck: true });
      console.info('message sent.')
    });
  });
}