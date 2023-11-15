"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongo_db_config_js_1 = require("./src/config/db/mongo-db-config.js");
const initial_data_js_1 = require("./src/config/db/initial-data.js");
const check_token_js_1 = require("./src/config/auth/check-token.js");
const rabbit_config_js_1 = require("./src/config/rabbitmq/rabbit-config.js");
const order_routes_js_1 = require("./src/modules/sales/routes/order-routes.js");
const tracing_middleware_js_1 = require("./src/config/tracing/tracing-middleware.js");
const secrets_js_1 = require("./src/config/constants/secrets.js");
const app = (0, express_1.default)();
;
const HALF_MINUTE = 30000;
const LOCAL_ENV = 'local';
if (process.env.NODE_ENV === LOCAL_ENV) {
    (0, rabbit_config_js_1.connectRabbitMQ)();
    (0, mongo_db_config_js_1.connectMongoDB)().then(() => {
    });
    (0, initial_data_js_1.createInitialData)();
}
else {
    console.info('Waiting for RabbitMQ and MongoDB containers to start...');
    setTimeout(() => {
        (0, mongo_db_config_js_1.connectMongoDB)();
        (0, rabbit_config_js_1.connectRabbitMQ)();
    }, HALF_MINUTE);
}
app.use(express_1.default.json());
app.get('/api/initial-data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, initial_data_js_1.createInitialData)();
    return res.json({ message: 'data created.' });
}));
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json({
        service: 'sales-api',
        status: 'up',
        httpStatus: 200
    });
}));
app.use(tracing_middleware_js_1.tracingMiddleware);
app.use(check_token_js_1.checkToken);
app.use(order_routes_js_1.orderRouter);
app.get('/api/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json({
        service: 'sales-api',
        status: 'up',
        httpStatus: 200
    });
}));
app.listen(secrets_js_1.PORT, () => {
    console.log(`Project successfully running on port ${secrets_js_1.PORT}`);
});
