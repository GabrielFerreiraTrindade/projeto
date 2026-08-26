"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatCep } from "@/lib/services/shipping-service";
import type { Address } from "@/types/account";

export function StepAddress({
  addresses,
  selectedId,
  onBack,
  onNext,
}: {
  addresses: Address[];
  selectedId: string | null;
  onBack: () => void;
  onNext: (addressId: string) => void;
}) {
  const [selected, setSelected] = useState(
    selectedId ?? addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id ?? "",
  );

  if (addresses.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Endereço</h2>
        <p className="text-sm text-muted-foreground">
          Você ainda não tem um endereço cadastrado. Cadastre um endereço
          para continuar a compra.
        </p>
        <Link href="/minha-conta/enderecos">
          <Button type="button">Cadastrar endereço</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">
        Para qual endereço enviamos?
      </h2>

      <div className="flex flex-col gap-3">
        {addresses.map((address) => (
          <label
            key={address.id}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 has-[:checked]:border-primary"
          >
            <input
              type="radio"
              name="address"
              value={address.id}
              checked={selected === address.id}
              onChange={() => setSelected(address.id)}
              className="mt-1 h-4 w-4"
            />
            <span className="text-sm">
              {address.label && (
                <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {address.label}
                </span>
              )}
              <span className="block font-medium text-foreground">
                {address.recipient}
              </span>
              <span className="text-muted-foreground">
                {address.street}, {address.number}
                {address.complement && ` — ${address.complement}`} —{" "}
                {address.neighborhood}, {address.city}/{address.state} — CEP{" "}
                {formatCep(address.zipCode)}
              </span>
            </span>
          </label>
        ))}
      </div>

      <Link
        href="/minha-conta/enderecos"
        className="w-fit text-sm font-medium text-primary hover:underline"
      >
        + Cadastrar novo endereço
      </Link>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button type="button" disabled={!selected} onClick={() => onNext(selected)}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
