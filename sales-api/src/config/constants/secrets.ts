export const MONGO_DB_URL = process.env.MONGO_DB_URL || 'mongodb://admin:123456@localhost:27017/sales?authSource=admin';
export const JWT_SECRET = process.env.JWT_SECRET || '4df5622ce61305cc2da15c8d9ddbbe94';
export const RABBIT_MQ_URL = process.env.RABBIT_MQ_URL || 'amqp://localhost:5672';
export const PRODUCT_API_URL = process.env.PRODUCT_API_URL || 'http://localhost:8081/api/products';
export const PORT = process.env.PORT || 8082