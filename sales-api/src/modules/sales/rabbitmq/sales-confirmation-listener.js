import amqp from 'amqplib/callback_api.js';
import { RABBIT_MQ_URL } from '../../../config/constants/secrets.js';
import { RABBIT_QUEUES } from '../../../config/rabbitmq/queue.js';

export function listenToSalesConfirmationQueue() {
  amqp.connect(RABBIT_MQ_URL, (err, connection) => {
    if (err) throw err;
    console.info('listening to sales confirmation queue...')
    connection.createChannel((err, channel) => {
      if (err) throw err;
      channel.consume(RABBIT_QUEUES.SALES_CONFIRMATION_QUEUE, (message) => {
        console.info(`receiving message from queue: ${message.content.toString()}`)
      }, { noAck: true })
    });
  });
}