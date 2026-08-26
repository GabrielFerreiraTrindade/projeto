"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/cart-context";
import { formatCurrency } from "@/lib/utils";
import type { Address } from "@/types/account";
import type { ShippingOption } from "@/lib/services/shipping-service";

import type { PaymentSelection } from "./step-payment";

export function StepReview({
  address,
  shipping,
  payment,
  isSubmitting,
  error,
  onBack,
  onSubmit,
}: {
  address: Address;
  shipping: ShippingOption;
  payment: PaymentSelection;
  isSubmitting: boolean;
  error: string | null;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const { lines, summary } = useCart();
  const [confirming, setConfirming] = useState(false);
  const total = summary.subtotal - summary.discount + shipping.price;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">
        Revise seu pedido
      </h2>

      <div className="rounded-xl border border-border p-4">
        <h3 className="mb-2 text-sm font-semibold text-foreground">Produtos</h3>
        <ul className="flex flex-col divide-y divide-border">
          {lines.map((line) => (
            <li key={line.productId} className="flex justify-between py-2 text-sm">
              <span className="text-muted-foreground">
                {line.quantity}x {line.product.name}
              </span>
              <span className="font-medium text-foreground">
                {formatCurrency(line.product.price * line.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-border p-4 text-sm">
        <h3 className="mb-1 text-sm font-semibold text-foreground">
          Endereço de entrega
        </h3>
        <p className="text-muted-foreground">
          {address.recipient} — {address.street}, {address.number}
          {address.complement && ` — ${address.complement}`}, {address.neighborhood},{" "}
          {address.city}/{address.state}
        </p>
      </div>

      <div className="rounded-xl border border-border p-4 text-sm">
        <h3 className="mb-1 text-sm font-semibold text-foreground">Entrega</h3>
        <p className="text-muted-foreground">
          {shipping.method} &middot; {shipping.carrier} &middot; até{" "}
          {shipping.days} dias úteis &middot;{" "}
          {shipping.price === 0 ? "Grátis" : formatCurrency(shipping.price)}
        </p>
      </div>

      <div className="rounded-xl border border-border p-4 text-sm">
        <h3 className="mb-1 text-sm font-semibold text-foreground">Pagamento</h3>
        <p className="text-muted-foreground">
          {payment.method === "PIX"
            ? "Pix"
            : `Cartão de crédito final ${payment.lastFourDigits} — ${payment.installments}x`}
        </p>
      </div>

      <div className="flex flex-col gap-1 rounded-xl border border-border p-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatCurrency(summary.subtotal)}</span>
        </div>
        {summary.discount > 0 && (
          <div className="flex justify-between text-primary">
            <span>Desconto</span>
            <span>-{formatCurrency(summary.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <span>Frete</span>
          <span>{shipping.price === 0 ? "Grátis" : formatCurrency(shipping.price)}</span>
        </div>
        <div className="mt-1 flex justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Voltar
        </Button>
        <Button
          type="button"
          size="lg"
          disabled={isSubmitting || confirming}
          onClick={() => {
            setConfirming(true);
            onSubmit();
          }}
          className="flex-1 sm:flex-none"
        >
          {isSubmitting ? "Processando..." : "Finalizar compra"}
        </Button>
      </div>
    </div>
  );
}
