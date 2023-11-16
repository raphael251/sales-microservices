import { Request, Response } from "express";
import { OrderService } from "../service/order-service"
import { extractTracingFieldsFromHeaders } from "../../../config/tracing/utils";
import { httpResponsesHelper } from "../../../config/express/helpers/http-responses";
import { OrderException } from "../exception/order-exception";
import { UnexpectedException } from "../exception/unexpected-exception";
import { injectable, singleton } from "tsyringe";

@injectable()
export class OrderController {
  constructor (private orderService: OrderService) {}

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
  
      const order = await this.orderService.createOrder(orderData, authUser, authorization, transactionId, serviceId);
      
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
    try {
      const { transactionId, serviceId } = extractTracingFieldsFromHeaders(req.headers);
  
      const { id } = req.params;
  
      if (!id) {
        return httpResponsesHelper.badRequest(res, 'The order ID must be informed.');
      }

      const order = await this.orderService.findById(id, transactionId, serviceId);
      return httpResponsesHelper.success(res, order);
    } catch (error) {
      if (error instanceof OrderException) {
        return httpResponsesHelper.badRequest(res, { message: error.message })
      }
      
      console.error('error finding order by id', error);

      if (error instanceof UnexpectedException) {
        return httpResponsesHelper.internalServerError(res)
      }

      return httpResponsesHelper.internalServerError(res);
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const { transactionId, serviceId } = extractTracingFieldsFromHeaders(req.headers);
      const orders = await this.orderService.findAll(transactionId, serviceId);
      return httpResponsesHelper.success(res, orders);
    } catch (error) {
      if (error instanceof OrderException) {
        return httpResponsesHelper.badRequest(res, { message: error.message })
      }
      
      console.error('error finding all orders', error);

      if (error instanceof UnexpectedException) {
        return httpResponsesHelper.internalServerError(res)
      }

      return httpResponsesHelper.internalServerError(res);
    }
  }

  async findByProductId(req: Request, res: Response) {
    try {
      const { transactionId, serviceId } = extractTracingFieldsFromHeaders(req.headers);
  
      const { productId } = req.params;
  
      if (!productId) {
        return httpResponsesHelper.badRequest(res, 'The order productId must be informed.');
      }
  
      const orders = await this.orderService.findByProductId(productId, transactionId, serviceId);
      return httpResponsesHelper.success(res, orders);
    } catch (error) {
      if (error instanceof OrderException) {
        return httpResponsesHelper.badRequest(res, { message: error.message })
      }
      
      console.error('error finding all orders by product id', error);

      if (error instanceof UnexpectedException) {
        return httpResponsesHelper.internalServerError(res)
      }

      return httpResponsesHelper.internalServerError(res);
    }
  }
}