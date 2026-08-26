"use server";

import { redirect } from "next/navigation";

import {
  OutOfStockError,
  submitCheckout,
  type CheckoutCartLine,
  type CheckoutCustomer,
  type CheckoutPaymentChoice,
  type CheckoutShipping,
} from "@/lib/services/checkout-service";
import { getCurrentUser } from "@/lib/services/auth-service";

export type SubmitCheckoutPayload = {
  addressId: string;
  lines: CheckoutCartLine[];
  customer: CheckoutCustomer;
  shipping: CheckoutShipping;
  payment: CheckoutPaymentChoice;
};

export type SubmitCheckoutState = { error: string } | undefined;

// Mensagens amigáveis (item 9 do pedido) — nunca expõe erro técnico/stack
// trace ao cliente.
const GENERIC_ERROR =
  "Não conseguimos processar o pagamento agora. Tente novamente.";
const DECLINED_ERROR =
  "Não foi possível aprovar o pagamento. Verifique os dados ou tente outra forma de pagamento.";

export async function submitCheckoutAction(
  payload: SubmitCheckoutPayload,
): Promise<SubmitCheckoutState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/checkout");
  }

  if (payload.lines.length === 0) {
    return { error: "Seu carrinho está vazio." };
  }

  let orderId: string;
  try {
    const { order } = await submitCheckout({
      userId: user.id,
      addressId: payload.addressId,
      lines: payload.lines,
      customer: payload.customer,
      shipping: payload.shipping,
      payment: payload.payment,
    });
    orderId = order.id;

    if (order.payment?.status === "FAILED") {
      return { error: DECLINED_ERROR };
    }
  } catch (error) {
    console.error("[checkout] falha ao finalizar compra", error);
    if (error instanceof OutOfStockError) {
      return {
        error: `"${error.productSlug}" ficou sem estoque suficiente. Ajuste as quantidades no carrinho e tente novamente.`,
      };
    }
    return { error: GENERIC_ERROR };
  }

  // redirect() precisa ficar fora do try/catch: ele funciona lançando um
  // sinal interno do Next.js que não pode ser tratado como um erro nosso.
  redirect(`/pedido/${orderId}/sucesso`);
}
