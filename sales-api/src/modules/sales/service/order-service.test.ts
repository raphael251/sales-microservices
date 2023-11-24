import { HydratedDocument } from "mongoose";
import { AuthUser } from "../../../config/auth/auth-user";
import { ProductClient } from "../../products/client/product-client"
import { ProductStockUpdateMessageSender } from "../../products/rabbitmq/product-stock-update-message-sender";
import { CreateOrderRequestDTO } from "../dto/create-order-request-dto";
import { OrderException } from "../exception/order-exception";
import { UnexpectedException } from "../exception/unexpected-exception";
import { OrderRepository } from "../repository/order-repository"
import { OrderService } from "./order-service"
import { IOrder } from "../model/order-model";
import { UpdateOrderStatusDTO } from "../dto/update-order-status-dto";

function makeSUT() {
  const productClient: jest.Mocked<ProductClient> = {
    checkProductStock: jest.fn()
  };

  const orderRepository: jest.Mocked<OrderRepository> = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByProductId: jest.fn(),
    save: jest.fn()
  };

  const productStockUpdateMessageSender: jest.Mocked<ProductStockUpdateMessageSender> = {
    sendMessageToProductStockUpdateQueue: jest.fn()
  }

  const sut = new OrderService(productClient, orderRepository, productStockUpdateMessageSender);

  return { productClient, orderRepository, sut };
}

describe('OrderService', () => {
  const dbOrder = {
    id: 'some-id',
    products: [
      {
        productId: 1,
        quantity: 2
      }
    ],
    user: {
      id: 1,
      name: 'any-name',
      email: 'any-email'
    },
    status: 'PENDING',
    transactionId: 'any-transaction-id',
    serviceId: 'any-service-id'
  } as HydratedDocument<IOrder>

  describe('createOrder', () => {
    test('should throw an error if the productClient returns that some product is unavailable', async () => {
      const { sut, productClient } = makeSUT();

      const requestDTO: CreateOrderRequestDTO = {
        products: [
          {
            productId: 1,
            quantity: 2
          }
        ]
      }

      const authUser: AuthUser = {
        id: 1,
        name: 'any-name',
        email: 'any-email'
      }

      jest.spyOn(productClient, 'checkProductStock').mockResolvedValueOnce(false)

      await expect(
        () => sut.createOrder(requestDTO, authUser, 'any-authorization-token', 'any-transaction-id', 'any-service-id')
      ).rejects.toThrow(new OrderException('the stock is out for the products.'));
    })
    
    test('should throw an error if there is some error saving the order in the repository', async () => {
      const { sut, productClient, orderRepository } = makeSUT();

      const requestDTO: CreateOrderRequestDTO = {
        products: [
          {
            productId: 1,
            quantity: 2
          }
        ]
      }

      const authUser: AuthUser = {
        id: 1,
        name: 'any-name',
        email: 'any-email'
      }

      jest.spyOn(productClient, 'checkProductStock').mockResolvedValueOnce(true)
      jest.spyOn(orderRepository, 'save').mockResolvedValueOnce(null)

      await expect(
        () => sut.createOrder(requestDTO, authUser, 'any-authorization-token', 'any-transaction-id', 'any-service-id')
      ).rejects.toThrow(new UnexpectedException('Error saving the created order to the database.'));
    })

    test('should call the product stock message sender and return the created order if everything is okay', async () => {
      const { sut, productClient, orderRepository } = makeSUT();

      const requestDTO: CreateOrderRequestDTO = {
        products: [
          {
            productId: 1,
            quantity: 2
          }
        ]
      }

      const authUser: AuthUser = {
        id: 1,
        name: 'any-name',
        email: 'any-email'
      }

      jest.spyOn(productClient, 'checkProductStock').mockResolvedValueOnce(true)
      jest.spyOn(orderRepository, 'save').mockResolvedValueOnce(dbOrder)

      const response = await sut.createOrder(requestDTO, authUser, 'any-authorization-token', 'any-transaction-id', 'any-service-id')
      
      expect(response).toEqual({
        id: 'some-id',
        products: [
          {
            productId: 1,
            quantity: 2
          }
        ],
        user: {
          id: 1,
          name: 'any-name',
          email: 'any-email'
        },
        status: 'PENDING',
        transactionId: 'any-transaction-id',
        serviceId: 'any-service-id'
      })
    })
  })
  
  describe('updateOrderStatus', () => {
    test('should not let the thrown error  get out of the function if no existing order is found', async () => {
      const { sut, orderRepository } = makeSUT();

      const updateOrderDTO: UpdateOrderStatusDTO = {
        salesId: 'any-sales-id',
        salesStatus: 'APPROVED',
        transactionId: 'any-transaction-id',
        serviceId: 'any-service-id',
      }

      jest.spyOn(orderRepository, 'findById').mockResolvedValueOnce(null);

      const result = await sut.updateOrderStatus(updateOrderDTO);

      expect(result).toBeUndefined();
    })

    test('should not call the order repository to save if the status has not changed', async () => {
      const { sut, orderRepository } = makeSUT();

      const updateOrderDTO: UpdateOrderStatusDTO = {
        salesId: 'any-sales-id',
        salesStatus: dbOrder.status,
        transactionId: 'any-transaction-id',
        serviceId: 'any-service-id',
      }

      jest.spyOn(orderRepository, 'findById').mockResolvedValueOnce(dbOrder);
      const saveOrderSpy = jest.spyOn(orderRepository, 'save')

      await sut.updateOrderStatus(updateOrderDTO);

      expect(saveOrderSpy).toHaveBeenCalledTimes(0)
    })

    test('should call the order repository to save if the status has changed', async () => {
      const { sut, orderRepository } = makeSUT();

      const updateOrderDTO: UpdateOrderStatusDTO = {
        salesId: 'any-sales-id',
        salesStatus: 'APPROVED',
        transactionId: 'any-transaction-id',
        serviceId: 'any-service-id',
      }

      jest.spyOn(orderRepository, 'findById').mockResolvedValueOnce(dbOrder);
      const saveOrderSpy = jest.spyOn(orderRepository, 'save')

      await sut.updateOrderStatus(updateOrderDTO);

      expect(saveOrderSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('findById', () => {
    test('should throw an error if no existing order is found', async () => {
      const { sut, orderRepository } = makeSUT()

      jest.spyOn(orderRepository, 'findById').mockResolvedValueOnce(null);

      await expect(
        () => sut.findById('any-id', 'any-transaction-id', 'any-service-id')
      )
        .rejects.toThrow(new OrderException('the order was not found.'))
    })

    test('should return the found order if everything is okay', async () => {
      const { sut, orderRepository } = makeSUT();

      jest.spyOn(orderRepository, 'findById').mockResolvedValueOnce(dbOrder);

      const result = await sut.findById('any-id', 'any-transaction-id', 'any-service-id');

      expect(result).toEqual(dbOrder)
    })
  })

  describe('findAll', () => {
    test('should throw an error if no existing orders is found', async () => {
      const { sut, orderRepository } = makeSUT()

      jest.spyOn(orderRepository, 'findAll').mockResolvedValueOnce(null);

      await expect(
        () => sut.findAll('any-transaction-id', 'any-service-id')
      )
        .rejects.toThrow(new OrderException('no orders were found.'))
    })

    test('should return the found orders if everything is okay', async () => {
      const { sut, orderRepository } = makeSUT();

      jest.spyOn(orderRepository, 'findAll').mockResolvedValueOnce([dbOrder]);

      const result = await sut.findAll('any-transaction-id', 'any-service-id');

      expect(result).toEqual([dbOrder])
    })
  })

  describe('findByProductId', () => {
    test('should throw an error if no existing orders is found', async () => {
      const { sut, orderRepository } = makeSUT()

      jest.spyOn(orderRepository, 'findByProductId').mockResolvedValueOnce(null);

      await expect(
        () => sut.findByProductId('any-product-id', 'any-transaction-id', 'any-service-id')
      )
        .rejects.toThrow(new OrderException('no orders were found.'))
    })

    test('should return the found orders if everything is okay', async () => {
      const { sut, orderRepository } = makeSUT();

      jest.spyOn(orderRepository, 'findByProductId').mockResolvedValueOnce([dbOrder]);

      const result = await sut.findByProductId('any-product-id', 'any-transaction-id', 'any-service-id');

      expect(result).toEqual([dbOrder])
    })
  })
})