import express from 'express';
import { createInitialData } from './src/config/db/initial-data.js'
import userRoutes from './src/modules/user/routes/user-routes.js'
import { tracingMiddleware } from './src/config/tracing/tracing-middleware.js';
import { PORT } from './src/config/constants/secrets.js';

const app = express();

const LOCAL_ENV = 'local';

if (process.env.NODE_ENV === LOCAL_ENV) {
  createInitialData()
}

app.use(express.json());

app.get('/api/initial-data', async (req, res) => {
  await createInitialData();
  return res.json({ message: 'data created.'})
})

app.get('/', (req, res) => {
  return res.status(200).json({
    service: 'auth-api',
    status: 'up',
    httpStatus: 200
  })
})

app.use(tracingMiddleware);

app.use(userRoutes);



app.listen(PORT, () => {
  console.info(`Server started successfully at port ${PORT}`);
})