import OrderService from "../service/order-service.js"

class OrderController {
  async createOrder(req, res) {
    const order = await OrderService.createOrder(req);
    return res.status(order.status).json(order);
  }

  async findById(req, res) {
    const order = await OrderService.findById(req);
    return res.status(order.status).json(order);
  }

  async findAll(req, res) {
    const order = await OrderService.findAll(req);
    return res.status(order.status).json(order);
  }

  async findByProductId(req, res) {
    const order = await OrderService.findByProductId(req);
    return res.status(order.status).json(order);
  }
}

export default new OrderController();