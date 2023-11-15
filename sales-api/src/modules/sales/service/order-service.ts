import { HTTP_STATUS } from "../../../config/constants/httpStatus";
import { sendMessageToProductStockUpdateQueue } from "../../products/rabbitmq/product-stock-update-sender";
import OrderRepository from "../repository/order-repository";
import { OrderException } from "../exception/order-exception";
import { ORDER_STATUS } from "../status/order-status";
import ProductClient from "../../products/client/product-client";
import TracingLogUtil from "../../../config/tracing/tracing-log-util";
import { Request } from "express";
import { extractTracingFieldsFromHeaders } from "../../../config/tracing/utils";
import { UpdateOrderDTO } from "../dto/update-order-dto";

class OrderService {
  async createOrder(req: Request) {
    try {
      const { transactionId, serviceId } = extractTracingFieldsFromHeaders(req.headers);

      TracingLogUtil.receivingRequest('POST', 'createOrder', req.body, transactionId, serviceId);

      const { body: orderData, authUser } = req;
      const { authorization } = req.headers;

      this.validateOrderData(orderData);
      
      const order = {
        status: ORDER_STATUS.PENDING,
        user: authUser,
        products: orderData.products,
        transactionId,
        serviceId
      };

      await this.validateProductStock(orderData.products, authorization, transactionId, serviceId);

      const createdOrder = await OrderRepository.save(order);
      this.sendMessage(createdOrder, transactionId, serviceId);

      const response = {
        status: HTTP_STATUS.SUCCESS,
        createdOrder
      };

      TracingLogUtil.respondingRequest('POST', 'createOrder', response, transactionId, serviceId);
      
      return response;
    } catch (err) {
      if (err instanceof OrderException) {
        return {
          status: err.status,
          message: err.message
        };
      }

      console.error(`error on order service ${this.createOrder.name}`, err);

      return {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: 'internal server error'
      };
    }
  }

  async updateOrder(orderMessage: string) {
    try {
      const order: UpdateOrderDTO = this.parseOrderFromMessage(orderMessage);
      TracingLogUtil.receivingRequest('message', 'updateOrder', order, order.transactionId, order.serviceId);

      if (order.salesId && order.salesStatus) {
        const existingOrder = await OrderRepository.findById(order.salesId);

        if (!existingOrder) throw new Error('could not find the existing order.');

        if (order.salesStatus && order.salesStatus !== existingOrder.status) {
          existingOrder.status = order.salesStatus;
          await OrderRepository.save(existingOrder);
        }
      } else {
        console.warn('the order message was not complete.')
      }
    } catch (err) {
      console.error('error updating order from a queue message.');
      if (err instanceof Error) console.error(err.message);
    }
  }

  parseOrderFromMessage(orderMessage: string): UpdateOrderDTO {
    try {
      return JSON.parse(orderMessage);
    } catch (err) {
      throw new Error('could not parse order message from queue.');
    }
  }

  validateOrderData(data: any) {
    if (!data || !data.products) {
      throw new OrderException(HTTP_STATUS.BAD_REQUEST, 'the products must be informed.')
    }
  }

  async validateProductStock(products: any, token: any, transactionId: any, serviceId: any) {
    const productsIsOutOfStock = await ProductClient.checkProductStock(products, token, transactionId, serviceId);

    if (!productsIsOutOfStock) {
      throw new OrderException(HTTP_STATUS.BAD_REQUEST, 'the stock is out for the products.')
    }
  }

  sendMessage(order: any, transactionid: any, serviceid: any) {
    const message = {
      salesId: order.id,
      products: order.products,
      transactionid,
      serviceid
      
    }
    sendMessageToProductStockUpdateQueue(message);
  }

  async findById(req: Request) {
    try {
      const { transactionId, serviceId } = extractTracingFieldsFromHeaders(req.headers);
      TracingLogUtil.receivingRequest('GET', 'order findById', req.body, transactionId, serviceId);

      const { id } = req.params;
      this.validateInformedId(id);
      const existingOrder = await OrderRepository.findById(id);
      if (!existingOrder) {
        throw new OrderException(HTTP_STATUS.BAD_REQUEST, 'the order was not found.');
      }
      
      const response = {
        status: HTTP_STATUS.SUCCESS,
        existingOrder
      };

      TracingLogUtil.respondingRequest('GET', 'order findById', response, transactionId, serviceId);

      return response;
    } catch (err) {
      if (err instanceof OrderException) {
        return {
          status: err.status,
          message: err.message
        };
      }

      console.error(`error on order service ${this.findById.name}`, err);

      return {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: 'internal server error'
      };
    }
  }

  async findAll(req: Request) {
    try {
      const { transactionId, serviceId } = extractTracingFieldsFromHeaders(req.headers);
      TracingLogUtil.receivingRequest('GET', 'order findAll', {}, transactionId, serviceId);

      const orders = await OrderRepository.findAll();
      if (!orders) {
        throw new OrderException(HTTP_STATUS.BAD_REQUEST, 'no orders were found.');
      }
      const response = {
        status: HTTP_STATUS.SUCCESS,
        orders
      };

      TracingLogUtil.respondingRequest('GET', 'order findAll', response, transactionId, serviceId);
      
      return response;
    } catch (err) {
      if (err instanceof OrderException) {
        return {
          status: err.status,
          message: err.message
        };
      }

      console.error(`error on order service ${this.findById.name}`, err);

      return {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: 'internal server error'
      };
    }
  }

  async findByProductId(req: Request) {
    try {
      const { transactionId, serviceId } = extractTracingFieldsFromHeaders(req.headers);
      TracingLogUtil.receivingRequest('GET', 'order findByProductId', req.params, transactionId, serviceId);

      const { productId } = req.params;
      this.validateInformedProductId(productId)
      const orders = await OrderRepository.findByProductId(productId);
      if (!orders) {
        throw new OrderException(HTTP_STATUS.BAD_REQUEST, 'no orders were found.');
      }

      const response = {
        status: HTTP_STATUS.SUCCESS,
        salesIds: orders.map(order => order.id)
      };

      TracingLogUtil.respondingRequest('GET', 'order findByProductId', response, transactionId, serviceId);

      return response;
    } catch (err) {
      if (err instanceof OrderException) {
        return {
          status: err.status,
          message: err.message
        };
      }

      console.error(`error on order service ${this.findById.name}`, err);

      return {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: 'internal server error'
      };
    }
  }

  
  validateInformedId(id: any) {
    if (!id) {
      throw new OrderException(HTTP_STATUS.BAD_REQUEST, 'The order ID must be informed.')
    }
  }

  
  validateInformedProductId(id: any) {
    if (!id) {
      throw new OrderException(HTTP_STATUS.BAD_REQUEST, 'The order productId must be informed.')
    }
  }
}

export default new OrderService();