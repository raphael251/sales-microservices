import { Order } from "../../modules/sales/model/order-module.js";

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
      status: 'APPROVED'
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
      status: 'REJECTED'
    }
  ])
  const orders = await Order.find({});
  console.info(`Info data ${JSON.stringify(orders, undefined, 2)}`);
}