import type { PaymentMethod, PaymentStatus } from "@prisma/client";

// Tipos do contrato de pagamento. Nenhum gateway específico é referenciado
// aqui — são os tipos que o checkout e os serviços de pedido conhecem.
// Trocar de gateway não deve exigir mudar nenhum destes tipos.

export type { PaymentMethod, PaymentStatus };

export type PaymentCustomer = {
  name: string;
  email: string;
  /** CPF/CNPJ, somente dígitos. */
  document: string;
  phone: {
    areaCode: string;
    number: string;
  };
};

export type PaymentLineItem = {
  description: string;
  quantity: number;
  amountInCents: number;
};

// O frontend nunca envia número de cartão para o nosso backend: envia um
// token gerado pelo SDK/endpoint de tokenização do gateway com a chave
// pública. `cardToken` é esse token, de uso único.
export type CreditCardPaymentInput = {
  method: "CREDIT_CARD";
  cardToken: string;
  installments: number;
};

export type PixPaymentInput = {
  method: "PIX";
  expiresInSeconds: number;
};

export type CreatePaymentInput = {
  /** Id do nosso pedido (Order.id) — usado para idempotência/rastreio no gateway. */
  orderId: string;
  amountInCents: number;
  customer: PaymentCustomer;
  items: PaymentLineItem[];
  payment: CreditCardPaymentInput | PixPaymentInput;
};

export type PixPaymentData = {
  /** Código "copia e cola". */
  qrCode: string;
  /** URL da imagem do QR code. */
  qrCodeUrl: string;
  expiresAt: string;
};

export type CreditCardPaymentData = {
  brand?: string;
  lastFourDigits?: string;
  installments: number;
};

// Resultado normalizado de qualquer operação de pagamento, independente do
// gateway. `raw` guarda a resposta crua só para depuração/conciliação —
// nunca deve ser repassada ao cliente.
export type PaymentResult = {
  /** Id do pedido no gateway (usado para consultar o status depois). */
  externalId: string;
  /** Id da cobrança no gateway (usado para cancelar/estornar). */
  chargeId?: string;
  status: PaymentStatus;
  method: PaymentMethod;
  amountInCents: number;
  pix?: PixPaymentData;
  card?: CreditCardPaymentData;
  raw: unknown;
};

export type CancelPaymentInput = {
  chargeId: string;
  amountInCents?: number;
};

export type RefundPaymentInput = {
  chargeId: string;
  amountInCents?: number;
};

export type WebhookProcessResult = {
  /** Id único deste evento/entrega no gateway — chave de idempotência. */
  externalEventId: string;
  eventType: string;
  /** Id do pedido no gateway a que este evento se refere. */
  externalPaymentId: string | null;
  status: PaymentStatus | null;
  raw: unknown;
};

export type IncomingWebhookRequest = {
  headers: Headers;
  rawBody: string;
};
