import { Order } from "../../modules/sales/model/order-model";

export async function createInitialData() {
  await Order.collection.drop();
  await Order.insertMany([
    {
      products: [
        {
          productId: 1001,
          quantity: 2
        },
        {
          productId: 1002,
          quantity: 1
        },
        {
          productId: 1003,
          quantity: 2
        }
      ],
      user: {
        id: 'user-id-1',
        name: 'User Test',
        email: 'testeuser@gmail.com'
      },
      status: 'APPROVED',
      transactionId: '8dfdc70b-8acc-4423-a9e1-75c0640923d',
      serviceId: 'e1e52cee-0263-4465-bd6c-b0e396ededd'
    },
    {
      products: [
        {
          productId: 1001,
          quantity: 4
        },
        {
          productId: 1003,
          quantity: 3
        },
      ],
      user: {
        id: 'user-id-2',
        name: 'User Test 2',
        email: 'testeuser2@gmail.com'
      },
      status: 'REJECTED',
      transactionId: 'e1e52cee-0263-4465-bd6c-b0e396ededd1',
      serviceId: '8dfdc70b-8acc-4423-a9e1-75c0640923d4'
    }
  ])
  const orders = await Order.find({});
  console.info(`Info data ${JSON.stringify(orders, undefined, 2)}`);
}