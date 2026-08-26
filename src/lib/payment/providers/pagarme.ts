import type { PaymentStatus } from "@prisma/client";

import {
  PaymentProviderError,
  PaymentWebhookAuthError,
  type PaymentProvider,
} from "../payment-provider";
import type {
  CancelPaymentInput,
  CreatePaymentInput,
  CreditCardPaymentData,
  IncomingWebhookRequest,
  PaymentResult,
  PixPaymentData,
  RefundPaymentInput,
  WebhookProcessResult,
} from "../payment-types";

// Implementação do gateway Pagar.me/Stone (checkout transparente, API v5).
//
// Baseado exclusivamente na documentação oficial (docs.pagar.me):
// - Criar pedido:        POST /orders            (docs.pagar.me/reference/criar-pedido-2)
// - Consultar pedido:    GET  /orders/{id}        (docs.pagar.me/reference/obter-pedido)
// - Cancelar/estornar:   DELETE /charges/{id}     (docs.pagar.me/reference/cancelar-cobrança)
// - Pix:                 payments[].pix           (docs.pagar.me/reference/pix-2)
// - Tokenização (cliente, chave pública): POST /tokens (docs.pagar.me/reference/criar-token-cartão-1)
// - Webhooks: NÃO existe assinatura criptográfica documentada. O mecanismo
//   oficial é Basic Auth opcional configurado na URL do webhook no painel
//   (docs.pagar.me/docs/webhooks). É isso que validamos aqui — não um HMAC
//   inventado.
//
// Limitação conhecida (avisada ao usuário antes de implementar, conforme
// pedido): as taxas de juros do parcelamento são configuradas na conta do
// Pagar.me, não há endpoint de "simulação" antes de criar o pedido. Por
// isso `installments` só é usado para pedir a quantidade de parcelas — o
// valor final de cada uma é o que o Pagar.me calcular e devolver.

const API_BASE_URL = "https://api.pagar.me/core/v5";

function getSecretKey(): string {
  const key = process.env.PAGARME_API_KEY;
  if (!key) {
    throw new PaymentProviderError(
      "PAGARME_API_KEY não configurada. Veja PAYMENT_SETUP.md.",
    );
  }
  return key;
}

function authHeader(): string {
  // Basic Auth: chave secreta como usuário, senha em branco.
  const token = Buffer.from(`${getSecretKey()}:`).toString("base64");
  return `Basic ${token}`;
}

async function pagarmeFetch(
  path: string,
  init: { method: string; body?: unknown },
): Promise<Record<string, unknown>> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: init.method,
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
  } catch (error) {
    throw new PaymentProviderError(
      "Não foi possível conectar ao gateway de pagamento.",
      error,
    );
  }

  const text = await response.text();
  const json = text ? (JSON.parse(text) as Record<string, unknown>) : {};

  if (!response.ok) {
    throw new PaymentProviderError(
      `Pagar.me retornou ${response.status} em ${init.method} ${path}.`,
      json,
    );
  }

  return json;
}

// Mapeia os status documentados de cobrança/pedido do Pagar.me
// ("pending" | "paid" | "failed" | "canceled" | "processing") para o
// PaymentStatus interno. Valores não reconhecidos (ex: "refunded", que
// aparece em eventos de webhook, não como status de cobrança) caem no
// mapeamento explícito abaixo.
const PAGARME_STATUS_MAP: Record<string, PaymentStatus> = {
  pending: "PENDING",
  processing: "PROCESSING",
  paid: "PAID",
  failed: "FAILED",
  canceled: "CANCELLED",
  refunded: "REFUNDED",
};

function mapStatus(pagarmeStatus: unknown): PaymentStatus {
  if (typeof pagarmeStatus === "string" && pagarmeStatus in PAGARME_STATUS_MAP) {
    return PAGARME_STATUS_MAP[pagarmeStatus];
  }
  return "PENDING";
}

type PagarmeCharge = {
  id: string;
  status: string;
  payment_method: string;
  last_transaction?: {
    qr_code?: string;
    qr_code_url?: string;
    installments?: number;
    card?: { brand?: string; last_four_digits?: string };
  };
};

type PagarmeOrder = {
  id: string;
  status: string;
  amount: number;
  charges?: PagarmeCharge[];
};

function toDocumentType(document: string): "individual" | "company" {
  return document.length > 11 ? "company" : "individual";
}

function toPaymentResult(
  order: PagarmeOrder,
  pixExpiresAt?: string,
): PaymentResult {
  const charge = order.charges?.[0];
  const lastTransaction = charge?.last_transaction;

  let pix: PixPaymentData | undefined;
  if (charge?.payment_method === "pix" && lastTransaction?.qr_code) {
    pix = {
      qrCode: lastTransaction.qr_code,
      qrCodeUrl: lastTransaction.qr_code_url ?? "",
      // O Pagar.me não documenta um campo de expiração absoluta na resposta;
      // calculamos a partir do `expires_in` que nós mesmos enviamos ao criar.
      expiresAt: pixExpiresAt ?? new Date().toISOString(),
    };
  }

  let card: CreditCardPaymentData | undefined;
  if (charge?.payment_method === "credit_card") {
    card = {
      brand: lastTransaction?.card?.brand,
      lastFourDigits: lastTransaction?.card?.last_four_digits,
      installments: lastTransaction?.installments ?? 1,
    };
  }

  return {
    externalId: order.id,
    chargeId: charge?.id,
    status: mapStatus(charge?.status ?? order.status),
    method: charge?.payment_method === "pix" ? "PIX" : "CREDIT_CARD",
    amountInCents: order.amount,
    pix,
    card,
    raw: order,
  };
}

export class PagarmeProvider implements PaymentProvider {
  readonly name = "pagarme";

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    const documentType = toDocumentType(input.customer.document);

    const payment =
      input.payment.method === "PIX"
        ? {
            payment_method: "pix",
            pix: { expires_in: String(input.payment.expiresInSeconds) },
          }
        : {
            payment_method: "credit_card",
            credit_card: {
              card_token: input.payment.cardToken,
              installments: input.payment.installments,
            },
          };

    const body = {
      code: input.orderId,
      items: input.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        amount: item.amountInCents,
      })),
      customer: {
        name: input.customer.name,
        email: input.customer.email,
        type: documentType,
        document: input.customer.document,
        phones: {
          home_phone: {
            country_code: "55",
            area_code: input.customer.phone.areaCode,
            number: input.customer.phone.number,
          },
        },
      },
      payments: [payment],
    };

    const json = await pagarmeFetch("/orders", { method: "POST", body });
    const pixExpiresAt =
      input.payment.method === "PIX"
        ? new Date(
            Date.now() + input.payment.expiresInSeconds * 1000,
          ).toISOString()
        : undefined;

    return toPaymentResult(json as unknown as PagarmeOrder, pixExpiresAt);
  }

  async getPayment(externalId: string): Promise<PaymentResult> {
    const json = await pagarmeFetch(`/orders/${externalId}`, { method: "GET" });
    return toPaymentResult(json as unknown as PagarmeOrder);
  }

  async cancelPayment(input: CancelPaymentInput): Promise<PaymentResult> {
    const json = await pagarmeFetch(`/charges/${input.chargeId}`, {
      method: "DELETE",
      body: input.amountInCents
        ? { amount: input.amountInCents }
        : undefined,
    });
    // DELETE /charges/{id} devolve a cobrança (charge), não um pedido —
    // normalizamos para o mesmo formato de PaymentResult.
    const charge = json as unknown as PagarmeCharge;
    return toPaymentResult({
      id: input.chargeId,
      status: charge.status,
      amount: input.amountInCents ?? 0,
      charges: [charge],
    });
  }

  async refundPayment(input: RefundPaymentInput): Promise<PaymentResult> {
    // No Pagar.me, cancelar uma cobrança de cartão/pix já paga é o mesmo
    // fluxo que estorná-la (DELETE /charges/{id}).
    return this.cancelPayment(input);
  }

  async processWebhook(
    request: IncomingWebhookRequest,
  ): Promise<WebhookProcessResult> {
    this.assertWebhookAuthenticity(request.headers);

    const payload = JSON.parse(request.rawBody) as {
      id: string;
      type: string;
      data?: PagarmeOrder;
    };

    if (!payload?.id || !payload.type) {
      throw new PaymentProviderError("Payload de webhook em formato inesperado.");
    }

    const order = payload.data;
    const charge = order?.charges?.[0];

    return {
      externalEventId: payload.id,
      eventType: payload.type,
      externalPaymentId: order?.id ?? null,
      status: order ? mapStatus(charge?.status ?? order.status) : null,
      raw: payload,
    };
  }

  /**
   * O Pagar.me não documenta uma assinatura criptográfica de webhook
   * (ex: HMAC). O mecanismo oficial é HTTP Basic Auth opcional, configurado
   * na URL do webhook pelo painel — é isso que validamos aqui.
   */
  private assertWebhookAuthenticity(headers: Headers) {
    const expectedUser = process.env.PAGARME_WEBHOOK_USER;
    const expectedPassword = process.env.PAGARME_WEBHOOK_PASSWORD;

    if (!expectedUser || !expectedPassword) {
      throw new PaymentProviderError(
        "PAGARME_WEBHOOK_USER/PAGARME_WEBHOOK_PASSWORD não configuradas. Veja PAYMENT_SETUP.md.",
      );
    }

    const authorization = headers.get("authorization");
    if (!authorization?.startsWith("Basic ")) {
      throw new PaymentWebhookAuthError();
    }

    const decoded = Buffer.from(
      authorization.slice("Basic ".length),
      "base64",
    ).toString("utf-8");
    const separatorIndex = decoded.indexOf(":");
    const user = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);

    if (user !== expectedUser || password !== expectedPassword) {
      throw new PaymentWebhookAuthError();
    }
  }
}
