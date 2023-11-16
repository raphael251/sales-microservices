export type OrderResponseDTO = {
  id: string;
  products: Array<{ productId: number, quantity: number }>;
  user: any;
  status: string;
  transactionId: string;
  serviceId: string;
}