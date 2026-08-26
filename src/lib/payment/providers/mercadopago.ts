import type { PaymentProvider } from "../payment-provider";
import type {
  CancelPaymentInput,
  CreatePaymentInput,
  IncomingWebhookRequest,
  PaymentResult,
  RefundPaymentInput,
  WebhookProcessResult,
} from "../payment-types";

const NOT_IMPLEMENTED_MESSAGE =
  "Gateway Mercado Pago ainda não implementado. Consulte a documentação oficial antes de implementar.";

// Placeholder para um futuro gateway Mercado Pago.
//
// Implementa a mesma interface PaymentProvider usada pelo Pagar.me — é só
// isso que o checkout e o webhook precisam para trocar de gateway
// (mudando PAYMENT_PROVIDER=mercadopago e as credenciais). O corpo dos
// métodos NÃO foi implementado porque a documentação oficial do Mercado
// Pago não foi consultada nesta etapa (regra do projeto: nunca inventar
// endpoints/parâmetros de uma API sem checar a documentação atual).
export class MercadoPagoProvider implements PaymentProvider {
  readonly name = "mercadopago";

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    void input;
    throw new Error(NOT_IMPLEMENTED_MESSAGE);
  }

  async getPayment(externalId: string): Promise<PaymentResult> {
    void externalId;
    throw new Error(NOT_IMPLEMENTED_MESSAGE);
  }

  async cancelPayment(input: CancelPaymentInput): Promise<PaymentResult> {
    void input;
    throw new Error(NOT_IMPLEMENTED_MESSAGE);
  }

  async refundPayment(input: RefundPaymentInput): Promise<PaymentResult> {
    void input;
    throw new Error(NOT_IMPLEMENTED_MESSAGE);
  }

  async processWebhook(
    request: IncomingWebhookRequest,
  ): Promise<WebhookProcessResult> {
    void request;
    throw new Error(NOT_IMPLEMENTED_MESSAGE);
  }
}
