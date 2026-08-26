import type {
  Address,
  Order,
  OrderItem,
  Payment,
  PaymentEvent,
  Product,
  Shipment,
} from "@prisma/client";

// Composições do pedido usadas pela camada de apresentação. Os tipos base
// (Order, OrderItem, Payment, Shipment...) vêm direto do Prisma.
export type OrderItemWithProduct = OrderItem & { product: Product };

export type OrderWithRelations = Order & {
  address: Address;
  items: OrderItemWithProduct[];
  payment: Payment | null;
  shipment: Shipment | null;
};

export type PaymentWithEvents = Payment & { events: PaymentEvent[] };
