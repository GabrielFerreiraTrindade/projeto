import type { OrderStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Pago",
  PROCESSING: "Em preparação",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

const STATUS_CLASSES: Record<OrderStatus, string> = {
  PENDING: "bg-warning text-warning-foreground",
  PAID: "bg-accent text-accent-foreground",
  PROCESSING: "bg-secondary text-secondary-foreground",
  SHIPPED: "bg-primary text-primary-foreground",
  DELIVERED: "bg-accent text-accent-foreground",
  CANCELLED: "bg-destructive text-destructive-foreground",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge className={cn(STATUS_CLASSES[status])}>{STATUS_LABELS[status]}</Badge>
  );
}
