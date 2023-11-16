import { Request, Response } from "express";
import OrderService from "../service/order-service"
import { extractTracingFieldsFromHeaders } from "../../../config/tracing/utils";
import { httpResponsesHelper } from "../../../config/express/helpers/http-responses";
import { OrderException } from "../exception/order-exception";
import { UnexpectedException } from "../exception/unexpected-exception";

class OrderController {
  async createOrder(req: Request, res: Response) {
    try {
      const { transactionId, serviceId } = extractTracingFieldsFromHeaders(req.headers);
  
      const { body: orderData, authUser } = req;
      const { authorization } = req.headers;
  
      if (!orderData || !orderData.products) {
        return httpResponsesHelper.badRequest(res, { message: 'the products must be informed.' })
      }
  
      if (!authUser) {
        return httpResponsesHelper.internalServerError(res)
      }
  
      if (!authorization) {
        return httpResponsesHelper.internalServerError(res)
      }
  
      const order = await OrderService.createOrder(orderData, authUser, authorization, transactionId, serviceId);
      
      return httpResponsesHelper.created(res, order);
    } catch (error) {
      if (error instanceof OrderException) {
        return httpResponsesHelper.badRequest(res, { message: error.message })
      }
      
      console.error('error creating order', error);

      if (error instanceof UnexpectedException) {
        return httpResponsesHelper.internalServerError(res)
      }

      return httpResponsesHelper.internalServerError(res);
    }
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