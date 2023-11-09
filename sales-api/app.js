import express from 'express'

import { connectMongoDB } from './src/config/db/mongo-db-config.js'
import { createInitialData } from './src/config/db/initial-data.js';
import { checkToken } from './src/config/auth/check-token.js';
import { connectRabbitMQ } from './src/config/rabbitmq/rabbit-config.js';
import { sendMessageToProductStockUpdateQueue } from './src/modules/products/rabbitmq/product-stock-update-sender.js';

const app = express();
const PORT = process.env.PORT || 8082;

await connectMongoDB();
await connectRabbitMQ();

createInitialData();

app.use(checkToken);

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