import { Router } from "express";
import OrderController from "../controller/order-controller.js";

export const orderRouter = new Router();

orderRouter.get('/api/orders/:id', OrderController.findById);
orderRouter.post('/api/orders', OrderController.createOrder);

