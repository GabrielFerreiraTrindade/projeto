import { PaymentWebhookAuthError, type PaymentProvider } from "@/lib/payment/payment-provider";
import type {
  CancelPaymentInput,
  CreatePaymentInput,
  IncomingWebhookRequest,
  PaymentResult,
  RefundPaymentInput,
  WebhookProcessResult,
} from "@/lib/payment/payment-types";

// Dublê de PaymentProvider para os testes: nunca faz chamada de rede real.
// Cada método pode ser sobrescrito por teste através dos campos `*Impl`.
export class FakePaymentProvider implements PaymentProvider {
  readonly name = "fake";

  createPaymentImpl: (input: CreatePaymentInput) => PaymentResult = (input) => ({
    externalId: `fake_order_${input.orderId}`,
    chargeId: `fake_charge_${input.orderId}`,
    status: "PENDING",
    method: input.payment.method,
    amountInCents: input.amountInCents,
    raw: {},
  });

  getPaymentImpl: (externalId: string) => PaymentResult = (externalId) => ({
    externalId,
    status: "PENDING",
    method: "PIX",
    amountInCents: 0,
    raw: {},
  });

  cancelPaymentImpl: (input: CancelPaymentInput) => PaymentResult = (input) => ({
    externalId: input.chargeId,
    chargeId: input.chargeId,
    status: "CANCELLED",
    method: "CREDIT_CARD",
    amountInCents: input.amountInCents ?? 0,
    raw: {},
  });

  refundPaymentImpl: (input: RefundPaymentInput) => PaymentResult = (input) => ({
    externalId: input.chargeId,
    chargeId: input.chargeId,
    status: "REFUNDED",
    method: "CREDIT_CARD",
    amountInCents: input.amountInCents ?? 0,
    raw: {},
  });

  webhookAuthShouldFail = false;
  webhookResultImpl: (request: IncomingWebhookRequest) => WebhookProcessResult = () => ({
    externalEventId: "fake_event",
    eventType: "order.paid",
    externalPaymentId: null,
    status: null,
    raw: {},
  });

  async createPayment(input: CreatePaymentInput) {
    return this.createPaymentImpl(input);
  }

  async getPayment(externalId: string) {
    return this.getPaymentImpl(externalId);
  }

  async cancelPayment(input: CancelPaymentInput) {
    return this.cancelPaymentImpl(input);
  }

  async refundPayment(input: RefundPaymentInput) {
    return this.refundPaymentImpl(input);
  }

  async processWebhook(request: IncomingWebhookRequest): Promise<WebhookProcessResult> {
    if (this.webhookAuthShouldFail) {
      throw new PaymentWebhookAuthError();
    }
    return this.webhookResultImpl(request);
  }
}
