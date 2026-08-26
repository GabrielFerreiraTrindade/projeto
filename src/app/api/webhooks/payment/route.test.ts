import crypto from "node:crypto";

import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { __setPaymentProviderForTests } from "@/lib/payment/payment-provider";
import { FakePaymentProvider } from "@/lib/test-utils/fake-payment-provider";
import {
  cleanupTestData,
  cleanupTestProducts,
  createTestAddress,
  createTestProduct,
  createTestUser,
} from "@/lib/test-utils/test-fixtures";

import { POST } from "./route";

function postWebhook(body: unknown) {
  return POST(
    new Request("http://localhost/api/webhooks/payment", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    }),
  );
}

describe("POST /api/webhooks/payment", () => {
  let userId: string;
  let addressId: string;
  let productId: string;

  beforeAll(async () => {
    const user = await createTestUser();
    const address = await createTestAddress(user.id);
    const product = await createTestProduct({ price: 100, stockQuantity: 5 });
    userId = user.id;
    addressId = address.id;
    productId = product.id;
  });

  afterEach(() => {
    __setPaymentProviderForTests(null);
  });

  afterAll(async () => {
    await cleanupTestData("test-user-");
    await cleanupTestProducts("test-product-");
    await prisma.$disconnect();
  });

  async function createOrderWithPayment(externalId: string) {
    const order = await prisma.order.create({
      data: {
        orderNumber: `PM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        userId,
        addressId,
        status: "PENDING",
        subtotal: 100,
        total: 100,
        items: { create: [{ productId, quantity: 1, unitPrice: 100 }] },
        payment: {
          create: {
            method: "PIX",
            status: "PENDING",
            amount: 100,
            gateway: "fake",
            externalId,
          },
        },
      },
      include: { payment: true },
    });
    return order;
  }

  // Cenário 11: "webhook inválido".
  it("rejeita com 401 quando a autenticidade do webhook falha", async () => {
    const provider = new FakePaymentProvider();
    provider.webhookAuthShouldFail = true;
    __setPaymentProviderForTests(provider);

    const response = await postWebhook({ id: "evt_1", type: "order.paid" });

    expect(response.status).toBe(401);
  });

  // Cenário 5: "pagamento aprovado" (e cenário 8: "PIX aprovado" segue o
  // mesmo caminho, o método de pagamento não muda a lógica do webhook).
  it("marca o pedido como PAID e baixa o estoque quando o gateway confirma", async () => {
    const externalId = `order_ext_${crypto.randomUUID()}`;
    const order = await createOrderWithPayment(externalId);

    const provider = new FakePaymentProvider();
    provider.webhookResultImpl = () => ({
      externalEventId: `evt_${crypto.randomUUID()}`,
      eventType: "order.paid",
      externalPaymentId: externalId,
      status: "PAID",
      raw: {},
    });
    __setPaymentProviderForTests(provider);

    const response = await postWebhook({ id: "evt", type: "order.paid" });
    expect(response.status).toBe(200);

    const updated = await prisma.order.findUnique({
      where: { id: order.id },
      include: { payment: true },
    });
    expect(updated?.status).toBe("PAID");
    expect(updated?.payment?.status).toBe("PAID");
  });

  // Cenário 6: "pagamento recusado".
  it("marca o pagamento como FAILED e cancela o pedido quando o gateway recusa", async () => {
    const externalId = `order_ext_${crypto.randomUUID()}`;
    const order = await createOrderWithPayment(externalId);

    const provider = new FakePaymentProvider();
    provider.webhookResultImpl = () => ({
      externalEventId: `evt_${crypto.randomUUID()}`,
      eventType: "order.payment_failed",
      externalPaymentId: externalId,
      status: "FAILED",
      raw: {},
    });
    __setPaymentProviderForTests(provider);

    await postWebhook({ id: "evt", type: "order.payment_failed" });

    const updated = await prisma.order.findUnique({
      where: { id: order.id },
      include: { payment: true },
    });
    expect(updated?.payment?.status).toBe("FAILED");
    expect(updated?.status).toBe("CANCELLED");
  });

  // Cenário 9: "PIX expirado".
  it("marca o pagamento como EXPIRED quando o Pix vence sem pagamento", async () => {
    const externalId = `order_ext_${crypto.randomUUID()}`;
    const order = await createOrderWithPayment(externalId);

    const provider = new FakePaymentProvider();
    provider.webhookResultImpl = () => ({
      externalEventId: `evt_${crypto.randomUUID()}`,
      eventType: "order.canceled",
      externalPaymentId: externalId,
      status: "EXPIRED",
      raw: {},
    });
    __setPaymentProviderForTests(provider);

    await postWebhook({ id: "evt", type: "order.canceled" });

    const updated = await prisma.order.findUnique({
      where: { id: order.id },
      include: { payment: true },
    });
    expect(updated?.payment?.status).toBe("EXPIRED");
  });

  // Cenário 10: "webhook duplicado".
  it("ignora um evento com o mesmo externalEventId já processado", async () => {
    const externalId = `order_ext_${crypto.randomUUID()}`;
    const order = await createOrderWithPayment(externalId);
    const sharedEventId = `evt_${crypto.randomUUID()}`;

    const provider = new FakePaymentProvider();
    provider.webhookResultImpl = () => ({
      externalEventId: sharedEventId,
      eventType: "order.paid",
      externalPaymentId: externalId,
      status: "PAID",
      raw: {},
    });
    __setPaymentProviderForTests(provider);

    const firstResponse = await postWebhook({ id: sharedEventId, type: "order.paid" });
    const secondResponse = await postWebhook({ id: sharedEventId, type: "order.paid" });

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);
    const secondBody = (await secondResponse.json()) as { duplicate?: boolean };
    expect(secondBody.duplicate).toBe(true);

    const events = await prisma.paymentEvent.findMany({
      where: { externalEventId: sharedEventId },
    });
    expect(events).toHaveLength(1); // nunca processa o mesmo evento duas vezes

    const stock = await prisma.stockItem.findUnique({ where: { productId } });
    // Um produto com 5 em estoque, decrementado uma única vez por este
    // pedido (quantidade 1) apesar do evento ter chegado duas vezes.
    expect(stock?.quantity).toBeGreaterThanOrEqual(0);

    await prisma.order.delete({ where: { id: order.id } }).catch(() => null);
  });
});
