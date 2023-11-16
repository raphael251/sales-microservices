import 'reflect-metadata'
import express from 'express'

import { connectMongoDB } from './src/config/db/mongo-db-config'
import { createInitialData } from './src/config/db/initial-data';
import { checkToken } from './src/config/auth/check-token';
import { connectRabbitMQ } from './src/config/rabbitmq/rabbit-config';
import { orderRouter } from './src/modules/sales/routes/order-routes';
import { tracingMiddleware } from './src/config/tracing/tracing-middleware';
import { PORT } from './src/config/constants/secrets';

const app = express();

const HALF_MINUTE = 30000;
const LOCAL_ENV = 'local';

if (process.env.NODE_ENV === LOCAL_ENV) {
  connectRabbitMQ();
  connectMongoDB().then(() => {
    
  });
  createInitialData();
} else {
  console.info('Waiting for RabbitMQ and MongoDB containers to start...');
  setTimeout(() => {
    connectMongoDB();
    connectRabbitMQ();
  }, HALF_MINUTE);
}

app.use(express.json())

app.get('/api/initial-data', async (req, res) => {
  await createInitialData();
  return res.json({ message: 'data created.'})
})

app.get('/', async (req, res) => {
  return res.status(200).json({
    service: 'sales-api',
    status: 'up',
    httpStatus: 200
  });
});

app.use(tracingMiddleware)
app.use(checkToken);
app.use(orderRouter);

app.get('/api/status', async (req, res) => {
  return res.status(200).json({
    service: 'sales-api',
    status: 'up',
    httpStatus: 200
  });
});

app.listen(PORT, () => {
  console.log(`Project successfully running on port ${PORT}`);
});