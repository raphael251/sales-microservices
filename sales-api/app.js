import express from 'express'

import { connectMongoDB } from './src/config/db/mongo-db-config.js'
import { createInitialData } from './src/config/db/initial-data.js';
import { checkToken } from './src/config/auth/check-token.js';
import { connectRabbitMQ } from './src/config/rabbitmq/rabbit-config.js';
import { orderRouter } from './src/modules/sales/routes/order-routes.js';
import { tracingMiddleware } from './src/config/tracing/tracing-middleware.js';
import { PORT } from './src/config/constants/secrets.js';

const app = express();;


const HALF_MINUTE = 30000;
const LOCAL_ENV = 'local';


if (process.env.NODE_ENV === LOCAL_ENV) {
  await connectMongoDB();
  await connectRabbitMQ();
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