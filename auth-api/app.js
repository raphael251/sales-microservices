import express from 'express';
import { createInitialData } from './src/config/db/initial-data.js'
import userRoutes from './src/modules/user/routes/user-routes.js'

const app = express();

const PORT = process.env.PORT || 8080;

createInitialData()

app.use(express.json());
app.use(userRoutes);

app.get('/api/status', (req, res) => {
  return res.status(200).json({
    service: 'auth-api',
    status: 'up',
    httpStatus: 200
  })
})

app.listen(PORT, () => {
  console.info(`Server started successfully at port ${PORT}`);
})