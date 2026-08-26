import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import {
  InsufficientStockError,
  createOrder,
  getOrderById,
  markOrderAsPaid,
  markOrderPaymentStatus,
} from "@/lib/services/order-service";
import {
  cleanupTestData,
  cleanupTestProducts,
  createTestAddress,
  createTestProduct,
  createTestUser,
} from "@/lib/test-utils/test-fixtures";

describe("order-service", () => {
  let userId: string;
  let addressId: string;

  beforeAll(async () => {
    const user = await createTestUser();
    const address = await createTestAddress(user.id);
    userId = user.id;
    addressId = address.id;
  });

  afterAll(async () => {
    await cleanupTestData("test-user-");
    await cleanupTestProducts("test-product-");
    await prisma.$disconnect();
  });

  // Cenário 1: "criar pedido".
  it("cria o pedido com itens, número único e status PENDING", async () => {
    const product = await createTestProduct({ price: 200, stockQuantity: 10 });

    const order = await createOrder({
      userId,
      addressId,
      lines: [{ productId: product.id, quantity: 2, unitPrice: 200 }],
      subtotal: 400,
      discount: 0,
      shippingCost: 20,
      total: 420,
      shippingMethod: "PAC",
      shippingCarrier: "Correios",
    });

    expect(order.status).toBe("PENDING");
    expect(order.orderNumber).toMatch(/^PM-/);
    expect(order.items).toHaveLength(1);
    expect(Number(order.total)).toBe(420);
    expect(order.shipment?.method).toBe("PAC");
  });

  // Cenário 13: "estoque com apenas uma unidade".
  it("baixa o estoque corretamente quando só resta 1 unidade", async () => {
    const product = await createTestProduct({ price: 100, stockQuantity: 1 });
    const order = await createOrder({
      userId,
      addressId,
      lines: [{ productId: product.id, quantity: 1, unitPrice: 100 }],
      subtotal: 100,
      discount: 0,
      shippingCost: 0,
      total: 100,
      shippingMethod: "PAC",
      shippingCarrier: "Correios",
    });

    await markOrderAsPaid(order.id);

    const stock = await prisma.stockItem.findUnique({ where: { productId: product.id } });
    const updatedOrder = await getOrderById(order.id);

    expect(stock?.quantity).toBe(0);
    expect(updatedOrder?.status).toBe("PAID");
    expect(updatedOrder?.payment).toBeNull(); // pedido criado sem Payment neste teste
  });

  it("rejeita quando não há estoque suficiente", async () => {
    const product = await createTestProduct({ price: 100, stockQuantity: 1 });
    const order = await createOrder({
      userId,
      addressId,
      lines: [{ productId: product.id, quantity: 5, unitPrice: 100 }],
      subtotal: 500,
      discount: 0,
      shippingCost: 0,
      total: 500,
      shippingMethod: "PAC",
      shippingCarrier: "Correios",
    });

    await expect(markOrderAsPaid(order.id)).rejects.toThrow(InsufficientStockError);

    const stock = await prisma.stockItem.findUnique({ where: { productId: product.id } });
    expect(stock?.quantity).toBe(1); // não mexeu no estoque
  });

  // Cenário 12: "pagamento confirmado duas vezes".
  it("marcar como pago duas vezes não baixa o estoque duas vezes", async () => {
    const product = await createTestProduct({ price: 100, stockQuantity: 5 });
    const order = await createOrder({
      userId,
      addressId,
      lines: [{ productId: product.id, quantity: 2, unitPrice: 100 }],
      subtotal: 200,
      discount: 0,
      shippingCost: 0,
      total: 200,
      shippingMethod: "PAC",
      shippingCarrier: "Correios",
    });

    await markOrderAsPaid(order.id);
    await markOrderAsPaid(order.id); // idempotente: já está PAID, não repete a baixa

    const stock = await prisma.stockItem.findUnique({ where: { productId: product.id } });
    expect(stock?.quantity).toBe(3); // 5 - 2, só uma vez
  });

  // Cenário 14: "duas compras simultâneas" — a garantia real vem do lock de
  // linha (FOR UPDATE) dentro da transação, não de um mutex em memória.
  it("duas compras concorrentes do último pneu: só uma consegue", async () => {
    const product = await createTestProduct({ price: 100, stockQuantity: 1 });

    const [orderA, orderB] = await Promise.all([
      createOrder({
        userId,
        addressId,
        lines: [{ productId: product.id, quantity: 1, unitPrice: 100 }],
        subtotal: 100,
        discount: 0,
        shippingCost: 0,
        total: 100,
        shippingMethod: "PAC",
        shippingCarrier: "Correios",
      }),
      createOrder({
        userId,
        addressId,
        lines: [{ productId: product.id, quantity: 1, unitPrice: 100 }],
        subtotal: 100,
        discount: 0,
        shippingCost: 0,
        total: 100,
        shippingMethod: "PAC",
        shippingCarrier: "Correios",
      }),
    ]);

    const results = await Promise.allSettled([
      markOrderAsPaid(orderA.id),
      markOrderAsPaid(orderB.id),
    ]);

    const succeeded = results.filter((result) => result.status === "fulfilled");
    const failed = results.filter((result) => result.status === "rejected");

    expect(succeeded).toHaveLength(1);
    expect(failed).toHaveLength(1);

    const stock = await prisma.stockItem.findUnique({ where: { productId: product.id } });
    expect(stock?.quantity).toBe(0); // nunca fica negativo
  });

  // Cenário 15: "cancelamento" (transição de status).
  it("marca o pedido como CANCELLED quando o pagamento falha/expira", async () => {
    const product = await createTestProduct({ price: 100, stockQuantity: 5 });
    const order = await createOrder({
      userId,
      addressId,
      lines: [{ productId: product.id, quantity: 1, unitPrice: 100 }],
      subtotal: 100,
      discount: 0,
      shippingCost: 0,
      total: 100,
      shippingMethod: "PAC",
      shippingCarrier: "Correios",
    });
    await prisma.payment.create({
      data: {
        orderId: order.id,
        method: "PIX",
        status: "PENDING",
        amount: 100,
        gateway: "fake",
        externalId: `fake_${order.id}`,
      },
    });

    await markOrderPaymentStatus(order.id, "EXPIRED");

    const updated = await getOrderById(order.id);
    expect(updated?.status).toBe("CANCELLED");
    expect(updated?.payment?.status).toBe("EXPIRED");
  });
});
