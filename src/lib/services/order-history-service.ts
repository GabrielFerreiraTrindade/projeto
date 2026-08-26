import { listOrdersByUser } from "@/lib/services/order-service";
import type { OrderWithRelations } from "@/types/order";

export async function getOrderHistory(userId: string): Promise<OrderWithRelations[]> {
  return listOrdersByUser(userId);
}
