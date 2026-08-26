"use client";

import { useCart } from "@/lib/cart/cart-context";

import { CartLineItem } from "./cart-line-item";
import { CartSummary } from "./cart-summary";
import { EmptyCart } from "./empty-cart";

export function CartPageContent() {
  const { lines, isHydrated } = useCart();

  if (!isHydrated) {
    return <div className="bg-muted h-64 animate-pulse rounded-xl" />;
  }

  if (lines.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <ul className="border-border flex flex-col rounded-xl border px-5">
        {lines.map((line) => (
          <CartLineItem key={line.productId} line={line} />
        ))}
      </ul>

      <CartSummary />
    </div>
  );
}
