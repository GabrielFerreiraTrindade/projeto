import type {
  CancelPaymentInput,
  CreatePaymentInput,
  IncomingWebhookRequest,
  PaymentResult,
  RefundPaymentInput,
  WebhookProcessResult,
} from "./payment-types";

// Contrato comum que qualquer gateway de pagamento precisa implementar. O
// checkout, os Server Actions e o webhook dependem só desta interface —
// nunca de um gateway específico diretamente. Trocar de gateway é
// implementar esta interface de novo (em src/lib/payment/providers/) e
// apontar PAYMENT_PROVIDER para o novo nome; nada mais muda.
export interface PaymentProvider {
  readonly name: string;

  createPayment(input: CreatePaymentInput): Promise<PaymentResult>;

  getPayment(externalId: string): Promise<PaymentResult>;

  cancelPayment(input: CancelPaymentInput): Promise<PaymentResult>;

  refundPayment(input: RefundPaymentInput): Promise<PaymentResult>;

  /**
   * Valida a autenticidade da requisição de webhook e normaliza o evento.
   * Deve lançar PaymentWebhookAuthError quando a validação falhar.
   */
  processWebhook(request: IncomingWebhookRequest): Promise<WebhookProcessResult>;
}

/** A requisição de webhook não pôde ser autenticada como vinda do gateway. */
export class PaymentWebhookAuthError extends Error {
  constructor(message = "Falha ao validar a autenticidade do webhook.") {
    super(message);
    this.name = "PaymentWebhookAuthError";
  }
}

/** Erro genérico de comunicação/uso do gateway (nunca exponha `cause` ao cliente). */
export class PaymentProviderError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "PaymentProviderError";
  }
}

let cachedProvider: PaymentProvider | null = null;

/** Resolve o provider configurado em PAYMENT_PROVIDER (padrão: "pagarme"). */
export async function getPaymentProvider(): Promise<PaymentProvider> {
  if (cachedProvider) return cachedProvider;

  const providerName = process.env.PAYMENT_PROVIDER ?? "pagarme";

  switch (providerName) {
    case "pagarme": {
      const { PagarmeProvider } = await import("./providers/pagarme");
      cachedProvider = new PagarmeProvider();
      return cachedProvider;
    }
    case "mercadopago": {
      const { MercadoPagoProvider } = await import("./providers/mercadopago");
      cachedProvider = new MercadoPagoProvider();
      return cachedProvider;
    }
    case "picpay": {
      const { PicPayProvider } = await import("./providers/picpay");
      cachedProvider = new PicPayProvider();
      return cachedProvider;
    }
    default:
      throw new PaymentProviderError(
        `Gateway de pagamento desconhecido: "${providerName}". Configure PAYMENT_PROVIDER.`,
      );
  }
}

/** Usado só pelos testes, para trocar o provider resolvido por um dublê. */
export function __setPaymentProviderForTests(provider: PaymentProvider | null) {
  cachedProvider = provider;
}
