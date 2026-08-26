"use client";

import { Lock } from "lucide-react";

import { useCart } from "@/lib/cart/cart-context";
import { formatCurrency } from "@/lib/utils";
import type { ShippingOption } from "@/lib/services/shipping-service";

export function CheckoutSummary({
  shipping,
}: {
  shipping: ShippingOption | null;
}) {
  const { lines, summary } = useCart();
  const total = summary.subtotal - summary.discount + (shipping?.price ?? 0);

  return (
    <details className="rounded-xl border border-border p-4 lg:open lg:p-5" open>
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-foreground lg:pointer-events-none">
        Resumo do pedido
        <span className="text-base font-bold lg:hidden">
          {formatCurrency(total)}
        </span>
      </summary>

      <div className="mt-4 flex flex-col gap-3">
        <ul className="flex flex-col gap-2">
          {lines.map((line) => (
            <li key={line.productId} className="flex justify-between gap-2 text-sm">
              <span className="text-muted-foreground">
                {line.quantity}x {line.product.name}
              </span>
              <span className="shrink-0 font-medium text-foreground">
                {formatCurrency(line.product.price * line.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-1 border-t border-border pt-3 text-sm">
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
            <span>Frete{shipping ? ` (${shipping.method})` : ""}</span>
            <span>
              {shipping
                ? shipping.price === 0
                  ? "Grátis"
                  : formatCurrency(shipping.price)
                : "a calcular"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-base font-semibold text-foreground">Total</span>
          <span className="text-xl font-bold text-foreground">
            {formatCurrency(total)}
          </span>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" aria-hidden />
          Compra 100% segura, sem sair do site.
        </p>
      </div>
    </details>
  );
}
