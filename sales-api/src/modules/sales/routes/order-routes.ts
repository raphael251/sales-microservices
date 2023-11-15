import { Router } from "express";
import OrderController from "../controller/order-controller";

export const orderRouter = Router();

orderRouter.post('/api/orders', OrderController.createOrder);
orderRouter.get('/api/orders/:id', OrderController.findById);
orderRouter.get('/api/orders/product/:productId', OrderController.findByProductId);
orderRouter.get('/api/orders', OrderController.findAll);


