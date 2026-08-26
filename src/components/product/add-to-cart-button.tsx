"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useCart } from "@/lib/cart/cart-context";

export function AddToCartButton({
  productId,
  quantity = 1,
  disabled,
  className,
  size,
}: {
  productId: string;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  size?: ButtonProps["size"];
}) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  function handleClick() {
    addItem(productId, quantity);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <Button
      type="button"
      size={size}
      disabled={disabled}
      onClick={handleClick}
      className={className}
    >
      {justAdded ? (
        <>
          <Check className="h-4 w-4" aria-hidden />
          Adicionado
        </>
      ) : (
        "Comprar"
      )}
    </Button>
  );
}
