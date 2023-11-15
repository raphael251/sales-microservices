import { Request, Response } from "express";
import OrderService from "../service/order-service"

class OrderController {
  async createOrder(req: Request, res: Response) {
    const order = await OrderService.createOrder(req);
    return res.status(order.status).json(order);
  }

  async findById(req: Request, res: Response) {
    const order = await OrderService.findById(req);
    return res.status(order.status).json(order);
  }

  async findAll(req: Request, res: Response) {
    const order = await OrderService.findAll(req);
    return res.status(order.status).json(order);
  }

  async findByProductId(req: Request, res: Response) {
    const order = await OrderService.findByProductId(req);
    return res.status(order.status).json(order);
  }
}

export default new OrderController();