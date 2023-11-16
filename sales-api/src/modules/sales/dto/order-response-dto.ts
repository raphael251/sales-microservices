import { AuthUser } from "../../../config/auth/auth-user";

export type OrderResponseDTO = {
  id: string;
  products: Array<{ productId: number, quantity: number }>;
  user: AuthUser;
  status: string;
  transactionId: string;
  serviceId: string;
}