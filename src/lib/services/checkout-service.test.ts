import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { __setPaymentProviderForTests } from "@/lib/payment/payment-provider";
import { OutOfStockError, submitCheckout } from "@/lib/services/checkout-service";
import { FakePaymentProvider } from "@/lib/test-utils/fake-payment-provider";
import {
  cleanupTestData,
  cleanupTestProducts,
  createTestAddress,
  createTestUser,
  createTestProduct,
} from "@/lib/test-utils/test-fixtures";

describe("checkout-service.submitCheckout", () => {
  let userId: string;
  let addressId: string;
  let fakeProvider: FakePaymentProvider;

  beforeAll(async () => {
    const user = await createTestUser();
    const address = await createTestAddress(user.id);
    userId = user.id;
    addressId = address.id;
  });

  afterEach(() => {
    __setPaymentProviderForTests(null);
  });

  afterAll(async () => {
    await cleanupTestData("test-user-");
    await cleanupTestProducts("test-product-");
    await prisma.$disconnect();
  });

  function useFakeProvider() {
    fakeProvider = new FakePaymentProvider();
    __setPaymentProviderForTests(fakeProvider);
    return fakeProvider;
  }

  const customer = {
    name: "Cliente de Teste",
    document: "52998224725",
    email: "cliente@example.com",
    phoneAreaCode: "31",
    phoneNumber: "999999999",
  };
  const shipping = { method: "PAC", carrier: "Correios", price: 20 };

  // Cenário 2: "adicionar produto" (várias linhas no mesmo pedido).
  it("cria o pedido com mais de um produto e recalcula os preços a partir do banco", async () => {
    useFakeProvider();
    const productA = await createTestProduct({ price: 100, stockQuantity: 10 });
    const productB = await createTestProduct({ price: 50, stockQuantity: 10 });

    const { order } = await submitCheckout({
      userId,
      addressId,
      lines: [
        { productId: productA.id, quantity: 2 },
        { productId: productB.id, quantity: 3 },
      ],
      customer,
      shipping,
      payment: { method: "PIX" },
    });

    expect(order.items).toHaveLength(2);
    expect(Number(order.subtotal)).toBe(2 * 100 + 3 * 50);
    expect(Number(order.total)).toBe(2 * 100 + 3 * 50 + 20);
  });

  // Cenário 4: "criar pagamento".
  it("cria o registro de pagamento com o retorno do gateway", async () => {
    const provider = useFakeProvider();
    provider.createPaymentImpl = (input) => ({
      externalId: `order_ext_${input.orderId}`,
      chargeId: `charge_ext_${input.orderId}`,
      status: "PROCESSING",
      method: "CREDIT_CARD",
      amountInCents: input.amountInCents,
      card: { brand: "Visa", lastFourDigits: "4242", installments: 3 },
      raw: {},
    });

    const product = await createTestProduct({ price: 300, stockQuantity: 10 });
    const { order } = await submitCheckout({
      userId,
      addressId,
      lines: [{ productId: product.id, quantity: 1 }],
      customer,
      shipping,
      payment: { method: "CREDIT_CARD", cardToken: "tok_fake", installments: 3 },
    });

    expect(order.payment).not.toBeNull();
    expect(order.payment?.gateway).toBe("fake");
    expect(order.payment?.status).toBe("PROCESSING");
    expect(order.payment?.cardLastFour).toBe("4242");
    expect(order.payment?.installments).toBe(3);
  });

  // Cenário 7: "PIX pendente".
  it("pedido com Pix guarda o qr code e fica com pagamento pendente", async () => {
    const provider = useFakeProvider();
    provider.createPaymentImpl = (input) => ({
      externalId: `order_ext_${input.orderId}`,
      status: "PENDING",
      method: "PIX",
      amountInCents: input.amountInCents,
      pix: {
        qrCode: "00020101pixcopiaecola",
        qrCodeUrl: "https://example.com/qr.png",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
      raw: {},
    });

    const product = await createTestProduct({ price: 150, stockQuantity: 10 });
    const { order } = await submitCheckout({
      userId,
      addressId,
      lines: [{ productId: product.id, quantity: 1 }],
      customer,
      shipping,
      payment: { method: "PIX" },
    });

    expect(order.payment?.status).toBe("PENDING");
    expect(order.payment?.pixQrCode).toBe("00020101pixcopiaecola");
    expect(order.payment?.pixExpiresAt).not.toBeNull();
    expect(order.status).toBe("PENDING"); // nunca PAID por causa da resposta síncrona
  });

  it("rejeita quando não há estoque suficiente para o pedido", async () => {
    useFakeProvider();
    const product = await createTestProduct({ price: 100, stockQuantity: 1 });

    await expect(
      submitCheckout({
        userId,
        addressId,
        lines: [{ productId: product.id, quantity: 5 }],
        customer,
        shipping,
        payment: { method: "PIX" },
      }),
    ).rejects.toThrow(OutOfStockError);
  });
});
