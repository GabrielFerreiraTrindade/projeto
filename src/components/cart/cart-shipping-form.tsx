"use client";

import { useId, useState } from "react";
import { Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart/cart-context";
import { formatCep } from "@/lib/services/shipping-service";

export function CartShippingForm() {
  const { shipping, calculateShipping } = useCart();
  const inputId = useId();
  const [cep, setCep] = useState(shipping?.cep ? formatCep(shipping.cep) : "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = calculateShipping(cep);
    setError(ok ? null : "Informe um CEP válido (8 dígitos).");
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="text-foreground flex items-center gap-2 text-sm font-medium"
      >
        <Truck className="h-4 w-4" aria-hidden />
        Calcular frete
      </label>
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <Input
          id={inputId}
          value={cep}
          onChange={(event) => setCep(formatCep(event.target.value))}
          placeholder="00000-000"
          inputMode="numeric"
          aria-label="CEP"
        />
        <Button type="submit" variant="outline" size="md">
          Calcular
        </Button>
      </form>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
