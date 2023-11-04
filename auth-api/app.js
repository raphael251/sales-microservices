import express from 'express';

const app = express();

const PORT = process.env.PORT || 8080;

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