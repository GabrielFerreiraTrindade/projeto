"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronDown, ShoppingCart, X } from "lucide-react";

import { ProductImagePlaceholder } from "@/components/product/product-image-placeholder";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/cart-context";
import { formatCurrency } from "@/lib/utils";

export function MiniCart() {
  const [isOpen, setIsOpen] = useState(false);
  const { lines, itemCount, summary, removeItem, isHydrated } = useCart();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="bg-primary text-primary-foreground inline-flex h-11 items-center gap-2 rounded-full py-1 pr-3 pl-1.5"
        aria-label="Carrinho"
        aria-expanded={isOpen}
      >
        <span className="bg-accent text-accent-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
          <ShoppingCart className="h-4 w-4" />
        </span>
        <span className="hidden flex-col items-start leading-tight sm:flex">
          <span className="text-[10px] font-medium tracking-wide uppercase opacity-80">
            Meus itens ({isHydrated ? itemCount : 0})
          </span>
          <span className="text-sm font-bold">
            {formatCurrency(isHydrated ? summary.subtotal - summary.discount : 0)}
          </span>
        </span>
        <ChevronDown className="hidden h-4 w-4 shrink-0 opacity-70 sm:block" />
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Fechar carrinho"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          />
          <div className="border-border bg-background absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-xl border p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-foreground text-sm font-semibold">
                Meu carrinho
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Fechar"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {lines.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                Seu carrinho está vazio.
              </p>
            ) : (
              <>
                <ul className="flex max-h-72 flex-col gap-3 overflow-y-auto">
                  {lines.map((line) => (
                    <li key={line.productId} className="flex gap-3">
                      <div className="bg-white text-muted-foreground relative flex h-14 w-14 shrink-0 items-center justify-center rounded-md p-2">
                        {line.product.images?.[0] ? (
                          <Image
                            src={line.product.images[0]}
                            alt={line.product.name}
                            fill
                            sizes="56px"
                            className="object-contain p-1"
                          />
                        ) : (
                          <ProductImagePlaceholder className="h-full w-full" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5">
                        <span className="text-foreground line-clamp-2 text-xs font-medium">
                          {line.product.name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          Qtd. {line.quantity} &middot;{" "}
                          {formatCurrency(line.product.price * line.quantity)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(line.productId)}
                        aria-label={`Remover ${line.product.name}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="border-border mt-3 flex items-center justify-between border-t pt-3 text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground font-semibold">
                    {formatCurrency(summary.subtotal - summary.discount)}
                  </span>
                </div>
              </>
            )}

            <div className="mt-4 flex flex-col gap-2">
              <Link href="/carrinho" onClick={() => setIsOpen(false)}>
                <Button className="w-full" size="md">
                  Ver carrinho
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
