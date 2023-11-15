import amqp from 'amqplib';
import { RABBIT_MQ_URL } from '../../../config/constants/secrets';
import { RABBIT_QUEUES } from '../../../config/rabbitmq/queue';

export async function sendMessageToProductStockUpdateQueue(message: any) {
  try {
    const connection = await amqp.connect(RABBIT_MQ_URL);

    const channel = await connection.createChannel();

    const stringifiedMessage = JSON.stringify(message);

    console.info(`sending message to product udpate stock: ${JSON.stringify(message)}`)

    channel.publish(
      RABBIT_QUEUES.PRODUCT_TOPIC,
      RABBIT_QUEUES.PRODUCT_STOCK_UPDATE_ROUTING_KEY,
      Buffer.from(stringifiedMessage)
    );

    console.info('message sent.')
  } catch (error) {
    console.error(`Error sending message to the product stock update queue.`)
  }
}