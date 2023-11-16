import { Router } from "express";
import { OrderController } from "../controller/order-controller";
import { container } from "tsyringe";

const orderController = container.resolve(OrderController)

export const orderRouter = Router();

orderRouter.post('/api/orders', (req, res) => orderController.createOrder(req, res));
orderRouter.get('/api/orders/:id', (req, res) => orderController.findById(req, res));
orderRouter.get('/api/orders/product/:productId', (req, res) => orderController.findByProductId(req, res));
orderRouter.get('/api/orders', (req, res) => orderController.findAll(req, res));
