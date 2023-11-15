"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = exports.PRODUCT_API_URL = exports.RABBIT_MQ_URL = exports.JWT_SECRET = exports.MONGO_DB_URL = void 0;
exports.MONGO_DB_URL = process.env.MONGO_DB_URL || 'mongodb://admin:123456@localhost:27017/sales?authSource=admin';
exports.JWT_SECRET = process.env.JWT_SECRET || '4df5622ce61305cc2da15c8d9ddbbe94';
exports.RABBIT_MQ_URL = process.env.RABBIT_MQ_URL || 'amqp://localhost:5672';
exports.PRODUCT_API_URL = process.env.PRODUCT_API_URL || 'http://localhost:8081/api/product';
exports.PORT = process.env.PORT || 8082;
