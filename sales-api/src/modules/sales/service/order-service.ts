import { HTTP_STATUS } from "../../../config/constants/httpStatus";
import { sendMessageToProductStockUpdateQueue } from "../../products/rabbitmq/product-stock-update-sender";
import OrderRepository from "../repository/order-repository";
import { OrderException } from "../exception/order-exception";
import { ORDER_STATUS } from "../status/order-status";
import ProductClient from "../../products/client/product-client";
import TracingLogUtil from "../../../config/tracing/tracing-log-util";
import { Request } from "express";
import { extractTracingFieldsFromHeaders } from "../../../config/tracing/utils";
import { UpdateOrderStatusDTO } from "../dto/update-order-status-dto";
import { CreateOrderRequestDTO } from "../dto/create-order-request-dto";
import { AuthUser } from "../../../config/auth/auth-user";
import { CreateOrderResponseDTO } from "../dto/create-order-response-dto";
import { UnexpectedException } from "../exception/unexpected-exception";
import { IOrder } from "../model/order-model";

class OrderService {
  async createOrder({ products }: CreateOrderRequestDTO, authUser: AuthUser, authorization: string, transactionId: string, serviceId: string): Promise<CreateOrderResponseDTO> {
    TracingLogUtil.receivingRequest('POST', 'createOrder', { products }, transactionId, serviceId);

    const order: IOrder = {
      status: ORDER_STATUS.PENDING,
      user: authUser,
      products,
      transactionId,
      serviceId
    };

    const productsIsAvailableInStock = await ProductClient.checkProductStock(products, authorization, transactionId, serviceId);

    if (!productsIsAvailableInStock) throw new OrderException('the stock is out for the products.')

    const createdOrder = await OrderRepository.save(order);

    if (!createdOrder) throw new UnexpectedException('Error saving the created order to the database.')

    const message = {
      salesId: createdOrder.id,
      products: createdOrder.products,
      transactionid: transactionId,
      serviceid: serviceId
    }

    sendMessageToProductStockUpdateQueue(message);

    TracingLogUtil.respondingRequest('POST', 'createOrder', { createdOrder }, transactionId, serviceId);
    
    return {
      products: createdOrder.products,
      user: createdOrder.user,
      status: createdOrder.status,
      transactionId: createdOrder.transactionId,
      serviceId: createdOrder.serviceId
    };
  }

  async updateOrderStatus(order: UpdateOrderStatusDTO): Promise<void> {
    try {
      TracingLogUtil.receivingRequest('message', 'updateOrderStatus', order, order.transactionId, order.serviceId);

      const existingOrder = await OrderRepository.findById(order.salesId);

      if (!existingOrder) throw new Error('could not find the existing order.');

      if (order.salesStatus && order.salesStatus !== existingOrder.status) {
        existingOrder.status = order.salesStatus;
        await OrderRepository.save(existingOrder);
      }
    } catch (error) {
      console.error('error updating order status.');
      if (error instanceof Error) console.error(error.message);
    }
  }

  async findById(req: Request) {
    const { transactionId, serviceId } = extractTracingFieldsFromHeaders(req.headers);
    TracingLogUtil.receivingRequest('GET', 'order findById', req.body, transactionId, serviceId);

    const { id } = req.params;
    this.validateInformedId(id);
    const existingOrder = await OrderRepository.findById(id);
    if (!existingOrder) {
      throw new OrderException('the order was not found.');
    }
    
    const response = {
      status: HTTP_STATUS.SUCCESS,
      existingOrder
    };

    TracingLogUtil.respondingRequest('GET', 'order findById', response, transactionId, serviceId);

    return response;
  }

  async findAll(req: Request) {
    const { transactionId, serviceId } = extractTracingFieldsFromHeaders(req.headers);
    TracingLogUtil.receivingRequest('GET', 'order findAll', {}, transactionId, serviceId);

    const orders = await OrderRepository.findAll();
    if (!orders) {
      throw new OrderException('no orders were found.');
    }
    const response = {
      status: HTTP_STATUS.SUCCESS,
      orders
    };

    TracingLogUtil.respondingRequest('GET', 'order findAll', response, transactionId, serviceId);
    
    return response;
  }

  async findByProductId(req: Request) {
    const { transactionId, serviceId } = extractTracingFieldsFromHeaders(req.headers);
    TracingLogUtil.receivingRequest('GET', 'order findByProductId', req.params, transactionId, serviceId);

    const { productId } = req.params;
    this.validateInformedProductId(productId)
    const orders = await OrderRepository.findByProductId(productId);
    if (!orders) {
      throw new OrderException('no orders were found.');
    }

    const response = {
      status: HTTP_STATUS.SUCCESS,
      salesIds: orders.map(order => order.id)
    };

    TracingLogUtil.respondingRequest('GET', 'order findByProductId', response, transactionId, serviceId);

    return response;
  }

  
  validateInformedId(id: any) {
    if (!id) {
      throw new OrderException('The order ID must be informed.')
    }
  }

  
  validateInformedProductId(id: any) {
    if (!id) {
      throw new OrderException('The order productId must be informed.')
    }
  }
}

export default new OrderService();