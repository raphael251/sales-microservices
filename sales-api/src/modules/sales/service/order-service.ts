import { ProductStockUpdateMessageSender } from "../../products/rabbitmq/product-stock-update-message-sender";
import { OrderRepository } from "../repository/order-repository";
import { OrderException } from "../exception/order-exception";
import { ORDER_STATUS } from "../status/order-status";
import { ProductClient } from "../../products/client/product-client";
import TracingLogUtil from "../../../config/tracing/tracing-log-util";
import { UpdateOrderStatusDTO } from "../dto/update-order-status-dto";
import { CreateOrderRequestDTO } from "../dto/create-order-request-dto";
import { AuthUser } from "../../../config/auth/auth-user";
import { OrderResponseDTO } from "../dto/order-response-dto";
import { UnexpectedException } from "../exception/unexpected-exception";
import { IOrder } from "../model/order-model";
import { singleton } from 'tsyringe';

@singleton()
export class OrderService {
  constructor (
    private productClient: ProductClient, 
    private orderRepository: OrderRepository,
    private productStockUpdateMessageSender: ProductStockUpdateMessageSender
  ) {}

  async createOrder({ products }: CreateOrderRequestDTO, authUser: AuthUser, authorization: string, transactionId: string, serviceId: string): Promise<OrderResponseDTO> {
    TracingLogUtil.receivingRequest('POST', 'createOrder', { products }, transactionId, serviceId);

    const order: IOrder = {
      status: ORDER_STATUS.PENDING,
      user: authUser,
      products,
      transactionId,
      serviceId
    };

    const productsIsAvailableInStock = await this.productClient.checkProductStock(products, authorization, transactionId, serviceId);

    if (!productsIsAvailableInStock) throw new OrderException('the stock is out for the products.')

    const createdOrder = await this.orderRepository.save(order);

    if (!createdOrder) throw new UnexpectedException('Error saving the created order to the database.')

    const message = {
      salesId: createdOrder.id,
      products: createdOrder.products,
      transactionid: transactionId,
      serviceid: serviceId
    }

    this.productStockUpdateMessageSender.sendMessageToProductStockUpdateQueue(message);

    TracingLogUtil.respondingRequest('POST', 'createOrder', { createdOrder }, transactionId, serviceId);
    
    return {
      id: createdOrder.id,
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

      const existingOrder = await this.orderRepository.findById(order.salesId);

      if (!existingOrder) throw new Error('could not find the existing order.');

      if (order.salesStatus && order.salesStatus !== existingOrder.status) {
        existingOrder.status = order.salesStatus;
        await this.orderRepository.save(existingOrder);
      }
    } catch (error) {
      console.error('error updating order status.');
      if (error instanceof Error) console.error(error.message);
    }
  }

  async findById(id: string, transactionId: string, serviceId: string): Promise<OrderResponseDTO> {
    TracingLogUtil.receivingRequest('GET', 'order findById', { id }, transactionId, serviceId);

    const existingOrder = await this.orderRepository.findById(id);

    if (!existingOrder) throw new OrderException('the order was not found.');

    TracingLogUtil.respondingRequest('GET', 'order findById', { existingOrder }, transactionId, serviceId);

    return {
      id: existingOrder.id,
      products: existingOrder.products,
      user: existingOrder.user,
      status: existingOrder.status,
      transactionId: existingOrder.transactionId,
      serviceId: existingOrder.serviceId
    };
  }

  async findAll(transactionId: string, serviceId: string): Promise<Array<OrderResponseDTO>> {
    TracingLogUtil.receivingRequest('GET', 'order findAll', {}, transactionId, serviceId);

    const orders = await this.orderRepository.findAll();

    if (!orders) throw new OrderException('no orders were found.');

    TracingLogUtil.respondingRequest('GET', 'order findAll', { orders }, transactionId, serviceId);
    
    return orders.map(order => ({
      id: order.id,
      products: order.products,
      user: order.user,
      status: order.status,
      transactionId: order.transactionId,
      serviceId: order.serviceId
    }));
  }

  async findByProductId(productId: string, transactionId: string, serviceId: string): Promise<{ salesIds: Array<string> }> {
    TracingLogUtil.receivingRequest('GET', 'order findByProductId', { productId }, transactionId, serviceId);

    const orders = await this.orderRepository.findByProductId(productId);

    if (!orders) {
      throw new OrderException('no orders were found.');
    }

    TracingLogUtil.respondingRequest('GET', 'order findByProductId', { orders }, transactionId, serviceId);

    const salesIds = orders.map(order => order.id as string);

    return { salesIds }
  }
}
