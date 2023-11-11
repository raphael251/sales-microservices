import { Schema, model } from 'mongoose';

const OrderSchema = new Schema({
  products: {
    type: Array,
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

export const Order = model("Order", OrderSchema);