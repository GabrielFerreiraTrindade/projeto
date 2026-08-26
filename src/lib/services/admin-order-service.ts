import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";
import type { OrderWithRelations } from "@/types/order";

// Consultas administrativas de pedidos. Só deve ser chamado depois de
// confirmar que o usuário tem role ADMIN (ver checagem no proxy e nas
// páginas /admin/**).

export async function listAllOrders(
  status?: OrderStatus,
): Promise<(OrderWithRelations & { user: { name: string; email: string } })[]> {
  return prisma.order.findMany({
    where: status ? { status } : undefined,
    include: {
      address: true,
      items: { include: { product: true } },
      payment: true,
      shipment: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function listLowStockProducts(threshold = 5) {
  return prisma.stockItem.findMany({
    where: { quantity: { lte: threshold } },
    include: { product: true },
    orderBy: { quantity: "asc" },
  });
}
