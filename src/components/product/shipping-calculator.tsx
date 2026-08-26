"use client";

import { useId, useState } from "react";
import { Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  estimateShipping,
  formatCep,
  isValidCep,
  type ShippingEstimate,
} from "@/lib/services/shipping-service";
import { formatCurrency } from "@/lib/utils";

export function ShippingCalculator({ price }: { price: number }) {
  const inputId = useId();
  const [cep, setCep] = useState("");
  const [estimate, setEstimate] = useState<ShippingEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidCep(cep)) {
      setError("Informe um CEP válido (8 dígitos).");
      setEstimate(null);
      return;
    }

    setError(null);
    setEstimate(estimateShipping(cep, price));
  }

  return (
    <div className="border-border flex flex-col gap-2 rounded-md border p-4">
      <label
        htmlFor={inputId}
        className="text-foreground flex items-center gap-2 text-sm font-medium"
      >
        <Truck className="h-4 w-4" aria-hidden />
        Calcular frete e prazo
      </label>
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <Input
          id={inputId}
          value={cep}
          onChange={(event) => setCep(formatCep(event.target.value))}
          placeholder="00000-000"
          inputMode="numeric"
          aria-label="CEP"
          className="max-w-40"
        />
        <Button type="submit" variant="outline" size="md">
          Calcular
        </Button>
      </form>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {estimate && (
        <p className="text-foreground text-sm">
          Chega em até{" "}
          <span className="font-semibold">{estimate.days} dias úteis</span>{" "}
          &middot;{" "}
          {estimate.price === 0 ? (
            <span className="text-primary font-semibold">Frete grátis</span>
          ) : (
            <span className="font-semibold">
              {formatCurrency(estimate.price)}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
