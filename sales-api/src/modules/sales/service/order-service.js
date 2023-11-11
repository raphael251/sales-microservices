import { HTTP_STATUS } from "../../../config/constants/httpStatus.js";
import { sendMessageToProductStockUpdateQueue } from "../../products/rabbitmq/product-stock-update-sender.js";
import OrderRepository from "../repository/order-repository.js";
import OrderException from "../exception/order-exception.js";
import { ORDER_STATUS } from "../status/order-status.js";
import ProductClient from "../../products/client/product-client.js";

class OrderService {
  async createOrder(req) {
    try {
      const { body: orderData, authUser } = req;
      const { authorization } = req.headers;

      this.validateOrderData(orderData);
      
      const order = {
        status: ORDER_STATUS.PENDING,
        user: authUser,
        products: orderData.products,
      };

      await this.validateProductStock(orderData.products, authorization);

      const createdOrder = await OrderRepository.save(order);
      this.sendMessage(createdOrder);

      return {
        status: HTTP_STATUS.SUCCESS,
        createdOrder
      };
        
    } catch (err) {
      return {
        status: err.status ? err.status : HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: err.message
      };
    }
  }

  async updateOrder(orderMessage) {
    try {
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

  async validateProductStock(products, token) {
    const productsIsOutOfStock = await ProductClient.checkProductStock(products, token);

    if (!productsIsOutOfStock) {
      throw new OrderException(HTTP_STATUS.BAD_REQUEST, 'the stock is out for the products.')
    }
  }

  sendMessage(order) {
    const message = {
      salesId: order.id,
      products: order.products
    }
    sendMessageToProductStockUpdateQueue(message);
  }

  async findById(req) {
    try {
      const { id } = req.params;
      this.validateInformedId(id);
      const existingOrder = await OrderRepository.findById(id);
      if (!existingOrder) {
        throw new OrderException(HTTP_STATUS.BAD_REQUEST, 'the order was not found');
      }
      return {
        status: HTTP_STATUS.SUCCESS,
        existingOrder
      };
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
}

export default new OrderService();