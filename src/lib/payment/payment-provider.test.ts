import { afterEach, describe, expect, it } from "vitest";

import { __setPaymentProviderForTests, getPaymentProvider } from "@/lib/payment/payment-provider";
import { FakePaymentProvider } from "@/lib/test-utils/fake-payment-provider";

describe("PaymentProvider abstraction", () => {
  afterEach(() => {
    __setPaymentProviderForTests(null);
  });

  // Cenário 15: "cancelamento".
  it("cancelPayment devolve o status CANCELLED", async () => {
    const fake = new FakePaymentProvider();
    __setPaymentProviderForTests(fake);

    const provider = await getPaymentProvider();
    const result = await provider.cancelPayment({ chargeId: "charge_1" });

    expect(result.status).toBe("CANCELLED");
    expect(result.chargeId).toBe("charge_1");
  });

  // Cenário 16: "reembolso".
  it("refundPayment devolve o status REFUNDED", async () => {
    const fake = new FakePaymentProvider();
    __setPaymentProviderForTests(fake);

    const provider = await getPaymentProvider();
    const result = await provider.refundPayment({ chargeId: "charge_2", amountInCents: 5000 });

    expect(result.status).toBe("REFUNDED");
    expect(result.amountInCents).toBe(5000);
  });

  it("reaproveita a mesma instância de provider entre chamadas (cache)", async () => {
    const fake = new FakePaymentProvider();
    __setPaymentProviderForTests(fake);

    const first = await getPaymentProvider();
    const second = await getPaymentProvider();

    expect(first).toBe(second);
  });
});
