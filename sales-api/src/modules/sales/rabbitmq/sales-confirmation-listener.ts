import amqp from 'amqplib';
import { RABBIT_MQ_URL } from '../../../config/constants/secrets';
import { RABBIT_QUEUES } from '../../../config/rabbitmq/queue';
import OrderService from '../service/order-service';

export async function listenToSalesConfirmationQueue() {
  try {
    const connection = await amqp.connect(RABBIT_MQ_URL);

    console.info('listening to sales confirmation queue...');

    const channel = await connection.createChannel();

    await channel.consume(RABBIT_QUEUES.SALES_CONFIRMATION_QUEUE, (message) => {
      if (!message) throw new Error('Error receiving message from the sales confirmation queue');

      console.info(`receiving message from queue: ${message.content.toString()}`)
      OrderService.updateOrder(message.content.toString())
    }, { noAck: true });
  } catch (error) {
    console.error('Error listening to the sales confirmation queue.', error)
  }
}