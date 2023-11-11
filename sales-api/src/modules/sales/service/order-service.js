import { HTTP_STATUS } from "../../../config/constants/httpStatus.js";
import { sendMessageToProductStockUpdateQueue } from "../../products/rabbitmq/product-stock-update-sender.js";
import OrderRepository from "../repository/order-repository.js";
import OrderException from "../exception/order-exception.js";
import { ORDER_STATUS } from "../status/order-status.js";
import ProductClient from "../../products/client/product-client.js";
import TracingLogUtil from "../../../config/tracing/tracing-log-util.js";

class OrderService {
  async createOrder(req) {
    try {
      const { transactionId, serviceId } = req.headers;
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
      return {
        status: err.status ? err.status : HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: err.message
      };
    }
  }

  async updateOrder(orderMessage) {
    try {
      TracingLogUtil.receivingRequest('message', 'updateOrder', orderMessage, orderMessage.transactionId, orderMessage.serviceId);
      const order = JSON.parse(orderMessage);
      if (order.salesId && order.salesStatus) {
        const existingOrder = await OrderRepository.findById(order.salesId);
        if (order.salesStatus && order.salesStatus !== existingOrder.status) {
          existingOrder.status = order.salesStatus;
          await OrderRepository.save(existingOrder);
        }
      } else {
        console.warn('the order message was not complete.')
      }
    } catch (err) {
      console.error('could not parse order message from queue.');
      console.error(err.message);
    }
  }

  validateOrderData(data) {
    if (!data || !data.products) {
      throw new OrderException(HTTP_STATUS.BAD_REQUEST, 'the products must be informed.')
    }
  }

  async validateProductStock(products, token, transactionId, serviceId) {
    const productsIsOutOfStock = await ProductClient.checkProductStock(products, token, transactionId, serviceId);

    if (!productsIsOutOfStock) {
      throw new OrderException(HTTP_STATUS.BAD_REQUEST, 'the stock is out for the products.')
    }
  }

  sendMessage(order, transactionid, serviceid) {
    const message = {
      salesId: order.id,
      products: order.products,
      transactionid,
      serviceid
    }
    sendMessageToProductStockUpdateQueue(message);
  }

  async findById(req) {
    try {
      const { transactionId, serviceId } = req.headers;
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
      return {
        status: err.status ? err.status : HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: err.message
      }
    }
  }

  async findAll(req) {
    try {
      const { transactionId, serviceId } = req.headers;
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
      return {
        status: err.status ? err.status : HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: err.message
      }
    }
  }

  async findByProductId(req) {
    try {
      const { transactionId, serviceId } = req.headers;
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
      return {
        status: err.status ? err.status : HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: err.message
      }
    }
  }

  
  validateInformedId(id) {
    if (!id) {
      throw new OrderException(HTTP_STATUS.BAD_REQUEST, 'The order ID must be informed.')
    }
  }

  
  validateInformedProductId(id) {
    if (!id) {
      throw new OrderException(HTTP_STATUS.BAD_REQUEST, 'The order productId must be informed.')
    }
  }
}

export default new OrderService();