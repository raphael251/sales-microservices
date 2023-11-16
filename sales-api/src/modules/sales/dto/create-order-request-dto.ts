export type CreateOrderRequestDTO = {
  products: Array<{ productId: number, quantity: number }>
}