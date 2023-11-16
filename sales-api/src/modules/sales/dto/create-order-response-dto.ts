export type CreateOrderResponseDTO = {
  products: Array<{ productId: number, quantity: number }>;
  user: any;
  status: string;
  transactionId: string;
  serviceId: string;
}