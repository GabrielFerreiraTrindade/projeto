import crypto from "node:crypto";

import { prisma } from "@/lib/prisma";
import type { OrderWithRelations } from "@/types/order";
import type { PaymentMethod } from "@prisma/client";

// Serviço de pedidos: criação, consulta e a transição para PAID (a única
// que baixa estoque). Toda escrita crítica roda dentro de uma transação do
// Postgres — nunca confia apenas no que o frontend informou.

export class InsufficientStockError extends Error {
  constructor(public readonly productId: string) {
    super(`Estoque insuficiente para o produto ${productId}.`);
    this.name = "InsufficientStockError";
  }
}

function generateOrderNumber(): string {
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `PM-${random}`;
}

export type CreateOrderLine = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type CreateOrderInput = {
  userId: string;
  addressId: string;
  lines: CreateOrderLine[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  shippingMethod: string;
  shippingCarrier: string;
};

const ORDER_INCLUDE = {
  address: true,
  items: { include: { product: true } },
  payment: true,
  shipment: true,
} as const;

/**
 * Cria o pedido (status PENDING) e o registro de frete. Não mexe em
 * estoque — reservar/baixar definitivamente só acontece quando o
 * pagamento é confirmado (ver markOrderAsPaid).
 */
export async function createOrder(
  input: CreateOrderInput,
): Promise<OrderWithRelations> {
  return prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: input.userId,
      addressId: input.addressId,
      status: "PENDING",
      subtotal: input.subtotal,
      discount: input.discount,
      shippingCost: input.shippingCost,
      total: input.total,
      items: {
        create: input.lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
      },
      shipment: {
        create: {
          method: input.shippingMethod,
          carrier: input.shippingCarrier,
          price: input.shippingCost,
          status: "PENDING",
        },
      },
    },
    include: ORDER_INCLUDE,
  });
}

export type CreatePaymentRecordInput = {
  orderId: string;
  method: PaymentMethod;
  amount: number;
  gateway: string;
  externalId: string;
  status: import("@prisma/client").PaymentStatus;
  cardBrand?: string;
  cardLastFour?: string;
  installments?: number;
  pixQrCode?: string;
  pixQrCodeUrl?: string;
  pixExpiresAt?: Date;
};

export async function createPaymentRecord(input: CreatePaymentRecordInput) {
  return prisma.payment.create({
    data: {
      orderId: input.orderId,
      method: input.method,
      amount: input.amount,
      gateway: input.gateway,
      externalId: input.externalId,
      status: input.status,
      cardBrand: input.cardBrand,
      cardLastFour: input.cardLastFour,
      installments: input.installments,
      pixQrCode: input.pixQrCode,
      pixQrCodeUrl: input.pixQrCodeUrl,
      pixExpiresAt: input.pixExpiresAt,
    },
  });
}

export async function getOrderById(
  orderId: string,
): Promise<OrderWithRelations | null> {
  return prisma.order.findUnique({ where: { id: orderId }, include: ORDER_INCLUDE });
}

export async function getOrderByIdForUser(
  orderId: string,
  userId: string,
): Promise<OrderWithRelations | null> {
  const order = await getOrderById(orderId);
  if (!order || order.userId !== userId) return null;
  return order;
}

export async function listOrdersByUser(
  userId: string,
): Promise<OrderWithRelations[]> {
  return prisma.order.findMany({
    where: { userId },
    include: ORDER_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Atualiza o status do pagamento sem mexer no pedido/estoque. Usado para
 * refletir status intermediários (ex: PROCESSING) vindos do gateway.
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: import("@prisma/client").PaymentStatus,
) {
  return prisma.payment.update({ where: { id: paymentId }, data: { status } });
}

/**
 * Único caminho que marca um pedido como PAID e baixa o estoque — chamado
 * exclusivamente pelo webhook, depois de validar a origem do evento.
 *
 * Usa transação com lock de linha (`FOR UPDATE`) no estoque: se duas
 * confirmações concorrentes tentarem baixar o último pneu, a segunda vê o
 * estoque já atualizado pela primeira (dentro da mesma transação) e falha
 * com InsufficientStockError em vez de deixar o estoque negativo.
 */
export async function markOrderAsPaid(orderId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true, payment: true },
    });
    if (!order) throw new Error(`Pedido ${orderId} não encontrado.`);

    // Idempotência: se já está PAID, não baixa estoque de novo.
    if (order.status === "PAID" || order.status === "PROCESSING") return;

    for (const item of order.items) {
      const rows = await tx.$queryRaw<{ id: string; quantity: number }[]>`
        SELECT id, quantity FROM stock_items WHERE "productId" = ${item.productId} FOR UPDATE
      `;
      const stock = rows[0];
      if (!stock || stock.quantity < item.quantity) {
        throw new InsufficientStockError(item.productId);
      }

      await tx.stockItem.update({
        where: { id: stock.id },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    await tx.order.update({ where: { id: orderId }, data: { status: "PAID" } });
    if (order.payment) {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: { status: "PAID" },
      });
    }
  });
}

export async function markOrderPaymentStatus(
  orderId: string,
  status: import("@prisma/client").PaymentStatus,
): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });
  if (!order?.payment) return;

  await prisma.payment.update({
    where: { id: order.payment.id },
    data: { status },
  });

  if (status === "CANCELLED" || status === "FAILED" || status === "EXPIRED") {
    await prisma.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
  }
}
