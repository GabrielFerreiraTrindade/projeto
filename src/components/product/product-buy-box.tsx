"use client";

import { useState } from "react";

import { MIN_LINE_QUANTITY } from "@/lib/cart/cart-calculations";

import { AddToCartButton } from "./add-to-cart-button";
import { QuantitySelector } from "./quantity-selector";

export function ProductBuyBox({ productId }: { productId: string }) {
  const [quantity, setQuantity] = useState(MIN_LINE_QUANTITY);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <QuantitySelector value={quantity} onChange={setQuantity} />
      <AddToCartButton
        productId={productId}
        quantity={quantity}
        size="lg"
        className="w-full sm:w-auto"
      />
    </div>
  );
}
