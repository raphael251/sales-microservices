import 'reflect-metadata';
import express from 'express';
import userRoutes from './src/modules/user/routes/user-routes'
import { tracingMiddleware } from './src/config/tracing/tracing-middleware';
import { PORT } from './src/config/constants/secrets';
import { connectDatabase } from './src/config/db/db-config';

const app = express();

connectDatabase()

app.use(express.json());

app.get('/', (req, res) => {
  return res.status(200).json({
    service: 'auth-api',
    status: 'up',
    httpStatus: 200
  })
})

app.use(tracingMiddleware);
app.use('/api/v1/users', userRoutes);

app.listen(PORT, () => {
  console.info(`Server started successfully at port ${PORT}`);
})