import { Schema, model } from 'mongoose';

export interface IOrder {
  products: Array<any>;
  user: any;
  status: string;
  transactionId: string;
  serviceId: string;
}

const OrderSchema = new Schema<IOrder>({
  products: {
    type: [Object],
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  transactionId: {
    type: String,
    required: true
  },
  serviceId: {
    type: String,
    required: true
  }
}, 
{
  timestamps: true
});

export const Order = model<IOrder>('Order', OrderSchema);