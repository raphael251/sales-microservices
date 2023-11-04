import express from 'express'

const app = express()
const PORT = process.env.PORT || 8082

app.get('/api/status', (req, res) => {
  return res.status(200).json({
    service: 'sales-api',
    status: 'up',
    httpStatus: 200
  })
})

app.listen(PORT, () => {
  console.log(`Project successfully running on port ${PORT}`)
})