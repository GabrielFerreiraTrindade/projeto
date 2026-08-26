"use client";

import { useState } from "react";
import { Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { ShippingOption } from "@/lib/services/shipping-service";

export function StepShipping({
  options,
  selected,
  onBack,
  onNext,
}: {
  options: ShippingOption[];
  selected: ShippingOption | null;
  onBack: () => void;
  onNext: (option: ShippingOption) => void;
}) {
  const [choice, setChoice] = useState<ShippingOption>(selected ?? options[0]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">
        Como você quer receber?
      </h2>

      <div className="flex flex-col gap-3">
        {options.map((option) => (
          <label
            key={option.method}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border p-4 has-[:checked]:border-primary"
          >
            <span className="flex items-center gap-3">
              <input
                type="radio"
                name="shipping"
                checked={choice.method === option.method}
                onChange={() => setChoice(option)}
                className="h-4 w-4"
              />
              <Truck className="h-5 w-5 text-muted-foreground" aria-hidden />
              <span>
                <span className="block text-sm font-medium text-foreground">
                  {option.method} &middot; {option.carrier}
                </span>
                <span className="text-xs text-muted-foreground">
                  Chega em até {option.days} dias úteis
                </span>
              </span>
            </span>
            <span className="text-sm font-semibold text-foreground">
              {option.price === 0 ? "Grátis" : formatCurrency(option.price)}
            </span>
          </label>
        ))}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button type="button" onClick={() => onNext(choice)}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
