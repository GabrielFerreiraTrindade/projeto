import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  PaymentWebhookAuthError,
  getPaymentProvider,
} from "@/lib/payment/payment-provider";
import {
  InsufficientStockError,
  markOrderAsPaid,
  markOrderPaymentStatus,
} from "@/lib/services/order-service";

// Webhook do gateway de pagamento. Nunca confia no frontend: um pedido só
// vira PAID depois que ESTA rota valida e processa a confirmação oficial
// do gateway.
//
// Garantias implementadas:
// - Autenticidade: delega ao provider (no Pagar.me, Basic Auth — ver
//   src/lib/payment/providers/pagarme.ts, não existe assinatura HMAC
//   documentada por eles).
// - Idempotência: PaymentEvent.externalEventId é @unique; o mesmo evento
//   nunca é processado duas vezes (constraint do banco, não só um `if`).
// - Logs: cada etapa relevante loga contexto suficiente para conciliação.

export async function POST(request: Request) {
  const rawBody = await request.text();

  let provider;
  try {
    provider = await getPaymentProvider();
  } catch (error) {
    console.error("[webhook] falha ao resolver payment provider", error);
    return NextResponse.json({ error: "provider_unavailable" }, { status: 500 });
  }

  let event;
  try {
    event = await provider.processWebhook({
      headers: request.headers,
      rawBody,
    });
  } catch (error) {
    if (error instanceof PaymentWebhookAuthError) {
      console.warn("[webhook] requisição rejeitada: autenticidade inválida");
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    console.error("[webhook] payload inválido", error);
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  console.info("[webhook] evento recebido", {
    externalEventId: event.externalEventId,
    eventType: event.eventType,
    externalPaymentId: event.externalPaymentId,
    status: event.status,
  });

  if (!event.externalPaymentId) {
    // Evento que não se refere a um pedido/cobrança (ex: teste de conexão).
    return NextResponse.json({ received: true });
  }

  const payment = await prisma.payment.findUnique({
    where: { externalId: event.externalPaymentId },
  });

  if (!payment) {
    console.warn("[webhook] nenhum pagamento local para o externalId", {
      externalPaymentId: event.externalPaymentId,
    });
    return NextResponse.json({ received: true });
  }

  // Idempotência real: a constraint única em externalEventId garante que,
  // mesmo sob concorrência, o mesmo evento só é inserido (e processado) uma
  // única vez.
  let paymentEvent;
  try {
    paymentEvent = await prisma.paymentEvent.create({
      data: {
        paymentId: payment.id,
        externalEventId: event.externalEventId,
        eventType: event.eventType,
        payload: event.raw as never,
      },
    });
  } catch (error) {
    if (
      error instanceof Object &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      console.info("[webhook] evento duplicado ignorado", {
        externalEventId: event.externalEventId,
      });
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("[webhook] falha ao registrar evento", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  try {
    if (event.status === "PAID") {
      try {
        await markOrderAsPaid(payment.orderId);
      } catch (error) {
        if (error instanceof InsufficientStockError) {
          // Pagamento confirmado, mas estoque insuficiente: caso raro (a
          // checagem otimista do checkout não pegou uma corrida entre a
          // criação do pedido e a confirmação do pagamento). Precisa de
          // conciliação manual — por isso o log em nível de erro.
          console.error(
            "[webhook] pagamento confirmado sem estoque suficiente — requer conciliação manual",
            { orderId: payment.orderId, productId: error.productId },
          );
        } else {
          throw error;
        }
      }
    } else if (event.status) {
      await markOrderPaymentStatus(payment.orderId, event.status);
    }

    await prisma.paymentEvent.update({
      where: { id: paymentEvent.id },
      data: { processed: true },
    });
  } catch (error) {
    console.error("[webhook] falha ao processar evento", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
