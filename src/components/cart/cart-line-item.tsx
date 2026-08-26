"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2 } from "lucide-react";

import { ProductImagePlaceholder } from "@/components/product/product-image-placeholder";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { useCart } from "@/lib/cart/cart-context";
import { formatCurrency } from "@/lib/utils";
import type { CartLine } from "@/types/cart";

export function CartLineItem({ line }: { line: CartLine }) {
  const { setQuantity, removeItem } = useCart();
  const { product, quantity } = line;
  const thumbnail = product.images?.[0];

  return (
    <li className="border-border flex flex-col gap-4 border-b py-5 last:border-b-0 sm:flex-row sm:items-center">
      <Link
        href={`/pneu/${product.slug}`}
        className="bg-white text-muted-foreground relative flex h-20 w-20 shrink-0 items-center justify-center rounded-lg p-3"
      >
        {thumbnail ? (
          <Image src={thumbnail} alt={product.name} fill sizes="80px" className="object-contain p-2" />
        ) : (
          <ProductImagePlaceholder className="h-full w-full" />
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {product.brand}
        </span>
        <Link
          href={`/pneu/${product.slug}`}
          className="text-foreground text-sm font-semibold hover:underline"
        >
          {product.name}
        </Link>
        <span className="text-muted-foreground text-xs">
          Medida {product.size}
        </span>
        <span className="text-foreground text-sm font-semibold sm:hidden">
          {formatCurrency(product.price)}
        </span>
      </div>

      <span className="text-foreground hidden w-28 text-sm sm:block">
        {formatCurrency(product.price)}
      </span>

      <QuantitySelector
        value={quantity}
        onChange={(next) => setQuantity(product.id, next)}
        showLabel={false}
      />

      <span className="text-foreground w-28 text-right text-sm font-semibold">
        {formatCurrency(product.price * quantity)}
      </span>

      <button
        type="button"
        onClick={() => removeItem(product.id)}
        aria-label={`Remover ${product.name} do carrinho`}
        className="text-muted-foreground hover:bg-muted hover:text-destructive flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
