"use client";

import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";

import {
  MAX_LINE_QUANTITY,
  MIN_LINE_QUANTITY,
  clampQuantity,
} from "@/lib/cart/cart-calculations";

export function QuantitySelector({
  value,
  onChange,
  showLabel = true,
}: {
  /** Quando informado, o componente fica controlado (ex: quantidade do carrinho). */
  value?: number;
  onChange?: (quantity: number) => void;
  showLabel?: boolean;
}) {
  const [internalQuantity, setInternalQuantity] = useState(MIN_LINE_QUANTITY);
  const isControlled = value !== undefined;
  const quantity = isControlled ? value : internalQuantity;
  const inputId = useId();

  function update(next: number) {
    const clamped = clampQuantity(next);
    if (!isControlled) setInternalQuantity(clamped);
    onChange?.(clamped);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {showLabel && (
        <label
          htmlFor={inputId}
          className="text-foreground text-sm font-medium"
        >
          Quantidade
        </label>
      )}
      <div className="border-border inline-flex h-11 w-fit items-center rounded-md border">
        <button
          type="button"
          onClick={() => update(quantity - 1)}
          disabled={quantity <= MIN_LINE_QUANTITY}
          aria-label="Diminuir quantidade"
          className="text-foreground flex h-full w-10 items-center justify-center disabled:opacity-40"
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={MIN_LINE_QUANTITY}
          max={MAX_LINE_QUANTITY}
          value={quantity}
          onChange={(event) =>
            update(Number(event.target.value) || MIN_LINE_QUANTITY)
          }
          className="border-border text-foreground h-full w-12 [appearance:textfield] border-x bg-transparent text-center text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => update(quantity + 1)}
          disabled={quantity >= MAX_LINE_QUANTITY}
          aria-label="Aumentar quantidade"
          className="text-foreground flex h-full w-10 items-center justify-center disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
