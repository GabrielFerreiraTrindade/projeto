"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/lib/cart/cart-context";
import { cn, formatCurrency } from "@/lib/utils";

import { CartShippingForm } from "./cart-shipping-form";

export function CartSummary() {
  const { summary, shipping } = useCart();

  return (
    <aside className="border-border flex flex-col gap-5 rounded-xl border p-5">
      <h2 className="text-foreground text-lg font-semibold">
        Resumo do pedido
      </h2>

      <div className="flex flex-col gap-2 text-sm">
        <div className="text-muted-foreground flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(summary.subtotal)}</span>
        </div>
        {summary.discount > 0 && (
          <div className="text-primary flex justify-between">
            <span>Desconto</span>
            <span>-{formatCurrency(summary.discount)}</span>
          </div>
        )}
        <div className="text-muted-foreground flex justify-between">
          <span>Frete</span>
          <span>
            {shipping === null
              ? "a calcular"
              : shipping.price === 0
                ? "Grátis"
                : formatCurrency(shipping.price)}
          </span>
        </div>
        {shipping && (
          <p className="text-muted-foreground text-xs">
            Chega em até {shipping.days} dias úteis
          </p>
        )}
      </div>

      <CartShippingForm />

      <div className="border-border flex items-center justify-between border-t pt-4">
        <span className="text-foreground text-base font-semibold">Total</span>
        <span className="text-foreground text-2xl font-bold">
          {formatCurrency(summary.total)}
        </span>
      </div>

      <Link href="/checkout" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
        Finalizar compra
      </Link>
    </aside>
  );
}
