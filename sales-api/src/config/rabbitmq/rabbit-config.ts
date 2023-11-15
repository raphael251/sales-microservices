import amqp from 'amqplib';
import { RABBIT_QUEUES } from './queue';
import { RABBIT_MQ_URL } from '../constants/secrets';
import { listenToSalesConfirmationQueue } from '../../modules/sales/rabbitmq/sales-confirmation-listener';

export async function connectRabbitMQ() {

  try {
    const connection = await amqp.connect(RABBIT_MQ_URL, { timeout: 180000 });
    console.info('start creating queues...')

    await createQueue(
      connection, 
      RABBIT_QUEUES.PRODUCT_STOCK_UPDATE_QUEUE,
      RABBIT_QUEUES.PRODUCT_STOCK_UPDATE_ROUTING_KEY,
      RABBIT_QUEUES.PRODUCT_TOPIC
    );

    await createQueue(
      connection, 
      RABBIT_QUEUES.SALES_CONFIRMATION_QUEUE,
      RABBIT_QUEUES.SALES_CONFIRMATION_ROUTING_KEY,
      RABBIT_QUEUES.PRODUCT_TOPIC
    );

    await connection.close();
    
    listenToSalesConfirmationQueue();
  } catch (error) {
    console.error(error);
  }
}

async function createQueue(connection: amqp.Connection, queue: string, routingKey: string, topic: string) {
  try {
    const channel = await connection.createChannel();

    await channel.assertExchange(topic, 'topic', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, topic, routingKey);
    console.info(`queue ${queue} and routingKey ${routingKey} created.`)
  } catch (error) {
    console.error(`there is an error binding the rabbitMQ routingKey ${routingKey} to the queue ${queue}`, error);
  }
}
