import type { PaymentStatus } from "@prisma/client";

import { siteConfig } from "@/lib/constants";

import {
  PaymentMethodUnsupportedError,
  PaymentProviderError,
  PaymentWebhookAuthError,
  type PaymentProvider,
} from "../payment-provider";
import type {
  CancelPaymentInput,
  CreatePaymentInput,
  IncomingWebhookRequest,
  PaymentResult,
  PixPaymentData,
  RefundPaymentInput,
  WebhookProcessResult,
} from "../payment-types";

// Implementação do gateway PayOnPag, baseada exclusivamente na
// documentação oficial (api.payonpag.io/integration/docs/api):
// - Criar transação Pix: POST /v1/transactions
// - Consultar transação:  GET  /v1/transactions/{id}
// - Webhook: payload { id, external_id, total_amount, status, payment_method }
//
// Limitações documentadas (conferidas antes de implementar — nunca
// inventadas):
// - A própria doc diz "Método de pagamento (atualmente apenas 'PIX')": não
//   existe endpoint de cartão de crédito. createPayment lança
//   PaymentMethodUnsupportedError para qualquer tentativa de CREDIT_CARD —
//   ver src/app/checkout/actions.ts para a mensagem mostrada ao cliente.
// - Não há endpoint documentado de cancelamento/estorno de uma transação
//   (o /v1/cashout existente é para sacar saldo da conta, não para estornar
//   uma cobrança específica a um cliente) — cancelPayment/refundPayment
//   lançam erro explícito em vez de inventar uma chamada.
// - Não há assinatura de webhook documentada (a doc só recomenda "verificar
//   a assinatura do webhook", sem dizer o header/algoritmo). Como
//   `webhook_url` é definida por nós em cada transação (não é fixa num
//   painel), autenticamos embutindo um segredo nosso na query string dela —
//   ver assertWebhookAuthenticity.
// - A doc não deixa 100% claro o formato do campo `pix` na resposta da
//   transação (só diz "pix (payload)") — tratamos tanto o caso de vir uma
//   string direta quanto um objeto com `payload`/`qr_code`, e registramos
//   `raw` sempre para conferência manual se o formato real for outro.

const API_BASE_URL = "https://api.payonpag.io/v1";

function getApiSecret(): string {
  const secret = process.env.PAYONPAG_API_SECRET;
  if (!secret) {
    throw new PaymentProviderError(
      "PAYONPAG_API_SECRET não configurada. Veja PAYMENT_SETUP.md.",
    );
  }
  return secret;
}

function getWebhookSecret(): string {
  const secret = process.env.PAYONPAG_WEBHOOK_SECRET;
  if (!secret) {
    throw new PaymentProviderError(
      "PAYONPAG_WEBHOOK_SECRET não configurada. Veja PAYMENT_SETUP.md.",
    );
  }
  return secret;
}

function buildWebhookUrl(): string {
  const secret = encodeURIComponent(getWebhookSecret());
  return `${siteConfig.url}/api/webhooks/payment?secret=${secret}`;
}

async function payonpagFetch(
  path: string,
  init: { method: string; body?: unknown },
): Promise<Record<string, unknown>> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: init.method,
      headers: {
        "api-secret": getApiSecret(),
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
      `PayOnPag retornou ${response.status} em ${init.method} ${path}.`,
      json,
    );
  }

  return json;
}

// Status documentados para uma transação: AUTHORIZED | PENDING | CHARGEBACK
// | FAILED | IN_DISPUTE. AUTHORIZED é o estado de "pago" (Pix é liquidação
// imediata, não existe um estado "processing" intermediário documentado).
const PAYONPAG_STATUS_MAP: Record<string, PaymentStatus> = {
  AUTHORIZED: "PAID",
  PENDING: "PENDING",
  FAILED: "FAILED",
  CHARGEBACK: "REFUNDED",
  IN_DISPUTE: "PROCESSING",
};

function mapStatus(status: unknown): PaymentStatus {
  if (typeof status === "string" && status in PAYONPAG_STATUS_MAP) {
    return PAYONPAG_STATUS_MAP[status];
  }
  return "PENDING";
}

type PayOnPagPix =
  | string
  | { payload?: string; qr_code?: string; qr_code_url?: string; expires_at?: string };

type PayOnPagTransaction = {
  id: string;
  external_id?: string;
  status: string;
  total_value?: number;
  total_amount?: number;
  payment_method?: string;
  pix?: PayOnPagPix;
};

function toPixData(
  pix: PayOnPagPix | undefined,
  fallbackExpiresAt: string,
): PixPaymentData | undefined {
  if (!pix) return undefined;
  const qrCode = typeof pix === "string" ? pix : (pix.payload ?? pix.qr_code);
  if (!qrCode) return undefined;

  return {
    qrCode,
    qrCodeUrl: typeof pix === "object" ? (pix.qr_code_url ?? "") : "",
    // A doc não documenta um campo de expiração na resposta (nem aceita um
    // na criação da transação) — usamos o prazo que a própria loja definiu
    // (PIX_EXPIRATION_SECONDS, ver checkout-service.ts) como aproximação,
    // nunca "agora" (isso expirava o Pix na hora, no primeiro render).
    expiresAt: (typeof pix === "object" ? pix.expires_at : undefined) ?? fallbackExpiresAt,
  };
}

function toPaymentResult(
  transaction: PayOnPagTransaction,
  fallbackExpiresAt: string,
): PaymentResult {
  const amount = transaction.total_value ?? transaction.total_amount ?? 0;

  return {
    externalId: transaction.id,
    chargeId: transaction.id,
    status: mapStatus(transaction.status),
    method: "PIX",
    amountInCents: Math.round(amount * 100),
    pix: toPixData(transaction.pix, fallbackExpiresAt),
    raw: transaction,
  };
}

export class PayOnPagProvider implements PaymentProvider {
  readonly name = "payonpag";

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    if (input.payment.method !== "PIX") {
      throw new PaymentMethodUnsupportedError(
        "PayOnPag não processa cartão de crédito — a documentação oficial da API só cobre Pix.",
      );
    }

    if (!input.customerIp) {
      throw new PaymentProviderError(
        "IP do cliente é obrigatório para criar uma transação no PayOnPag.",
      );
    }

    const body = {
      external_id: input.orderId,
      total_amount: input.amountInCents / 100,
      payment_method: "PIX",
      webhook_url: buildWebhookUrl(),
      ip: input.customerIp,
      // A doc pede um "id" por item; usamos um id sintético estável, já que
      // PaymentLineItem não carrega o id do produto (só descrição/qtd/valor).
      items: input.items.map((item, index) => ({
        id: `${input.orderId}-item-${index}`,
        title: item.description,
        description: item.description,
        price: item.amountInCents / 100,
        quantity: item.quantity,
        is_physical: true,
      })),
      customer: {
        name: input.customer.name,
        email: input.customer.email,
        phone: `${input.customer.phone.areaCode}${input.customer.phone.number}`,
        document_type: input.customer.document.length > 11 ? "CNPJ" : "CPF",
        document: input.customer.document,
      },
    };

    const json = await payonpagFetch("/transactions", { method: "POST", body });
    const fallbackExpiresAt = new Date(
      Date.now() + input.payment.expiresInSeconds * 1000,
    ).toISOString();
    const result = toPaymentResult(json as unknown as PayOnPagTransaction, fallbackExpiresAt);

    // Sem QR code o cliente não tem como pagar — melhor falhar alto (e
    // registrar a resposta crua pra depuração) do que devolver um "sucesso"
    // que na prática deixa o pedido preso em "aguardando pagamento" pra
    // sempre. Não bloqueia se o PayOnPag já devolver a transação como paga
    // (não deveria acontecer num Pix recém-criado, mas não custa permitir).
    if (!result.pix && result.status !== "PAID") {
      console.error("[payonpag] transação criada sem dados de Pix na resposta", json);
      throw new PaymentProviderError(
        "PayOnPag criou a transação mas não devolveu o QR code do Pix.",
        json,
      );
    }

    return result;
  }

  async getPayment(externalId: string): Promise<PaymentResult> {
    const json = await payonpagFetch(`/transactions/${externalId}`, { method: "GET" });
    // Consulta de status não tem o expiresInSeconds original à mão — o
    // chamador já guarda o pixExpiresAt real da criação, então esse
    // fallback só entra em jogo num caso de borda (nunca é o que decide a
    // contagem regressiva mostrada ao cliente).
    const fallbackExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    return toPaymentResult(json as unknown as PayOnPagTransaction, fallbackExpiresAt);
  }

  async cancelPayment(input: CancelPaymentInput): Promise<PaymentResult> {
    void input;
    throw new PaymentProviderError(
      "PayOnPag não documenta um endpoint de cancelamento de transação Pix.",
    );
  }

  async refundPayment(input: RefundPaymentInput): Promise<PaymentResult> {
    void input;
    throw new PaymentProviderError(
      "PayOnPag não documenta um endpoint de estorno ao cliente (o /v1/cashout existente é para saque de saldo da própria conta, não estorno de uma cobrança).",
    );
  }

  async processWebhook(request: IncomingWebhookRequest): Promise<WebhookProcessResult> {
    this.assertWebhookAuthenticity(request.url);

    const payload = JSON.parse(request.rawBody) as {
      id?: string;
      external_id?: string;
      total_amount?: number;
      status?: string;
      payment_method?: string;
    };

    if (!payload?.id) {
      throw new PaymentProviderError("Payload de webhook em formato inesperado.");
    }

    return {
      externalEventId: payload.id,
      eventType: payload.status
        ? `transaction.${payload.status.toLowerCase()}`
        : "transaction.updated",
      externalPaymentId: payload.id,
      status: payload.status ? mapStatus(payload.status) : null,
      raw: payload,
    };
  }

  /**
   * O PayOnPag não documenta assinatura de webhook. Como `webhook_url` é
   * definida por nós por transação (não fixa num painel), validamos um
   * segredo nosso embutido na query string dela.
   */
  private assertWebhookAuthenticity(url: string) {
    const expected = getWebhookSecret();
    const received = new URL(url).searchParams.get("secret");
    if (received !== expected) {
      throw new PaymentWebhookAuthError();
    }
  }
}
