import 'reflect-metadata'
import express from 'express'
import { connectMongoDB } from './src/config/db/mongo-db-config'
import { checkToken } from './src/config/auth/check-token';
import { connectRabbitMQ } from './src/config/rabbitmq/rabbit-config';
import { orderRouter } from './src/modules/sales/routes/order-routes';
import { tracingMiddleware } from './src/config/tracing/tracing-middleware';
import { PORT } from './src/config/constants/secrets';

const app = express();

connectMongoDB();
connectRabbitMQ();


app.use(express.json())

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