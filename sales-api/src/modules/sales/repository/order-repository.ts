import { HydratedDocument } from "mongoose";
import { IOrder, Order } from "../model/order-model";

class OrderRepository {
  async save(order: IOrder): Promise<HydratedDocument<IOrder> | null> {
    try {
      return await Order.create(order);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async findById(id: string): Promise<HydratedDocument<IOrder> | null> {
    try {
      return await Order.findById(id);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async findAll(): Promise<Array<HydratedDocument<IOrder>> | null> {
    try {
      return await Order.find({});
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async findByProductId(productId: string): Promise<Array<HydratedDocument<IOrder>> | null> {
    try {
      return await Order.find({ 'products.productId': Number(productId) });
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

export default new OrderRepository();