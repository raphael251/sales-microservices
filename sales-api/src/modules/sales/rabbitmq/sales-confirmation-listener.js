import amqp from 'amqplib';
import { RABBIT_MQ_URL } from '../../../config/constants/secrets.js';
import { RABBIT_QUEUES } from '../../../config/rabbitmq/queue.js';
import OrderService from '../service/order-service.js';

export async function listenToSalesConfirmationQueue() {
  try {
    const connection = await amqp.connect(RABBIT_MQ_URL);

    console.info('listening to sales confirmation queue...');

    const channel = await connection.createChannel();

    await channel.consume(RABBIT_QUEUES.SALES_CONFIRMATION_QUEUE, (message) => {
      console.info(`receiving message from queue: ${message.content.toString()}`)
      OrderService.updateOrder(message.content.toString())
    }, { noAck: true });
  } catch (error) {
    console.error(`Error listening to the sales confirmation queue.`)
  }
}