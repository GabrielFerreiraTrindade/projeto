"use client";

import { useState } from "react";
import { Pencil, Star, Trash2 } from "lucide-react";

import { formatCep } from "@/lib/services/shipping-service";
import type { Address } from "@/types/account";

import {
  deleteAddressAction,
  setDefaultAddressAction,
  updateAddressAction,
} from "./actions";
import { AddressForm } from "./address-form";

export function AddressCard({ address }: { address: Address }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="border-border rounded-xl border p-5 sm:col-span-2">
        <h2 className="text-foreground mb-4 text-lg font-semibold">
          Editar endereço
        </h2>
        <AddressForm
          action={updateAddressAction}
          address={address}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="border-border flex flex-col gap-3 rounded-xl border p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          {address.label && (
            <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              {address.label}
            </span>
          )}
          {address.isDefault && (
            <span className="text-primary ml-2 inline-flex items-center gap-1 text-xs font-medium">
              <Star className="fill-primary h-3 w-3" aria-hidden />
              Padrão
            </span>
          )}
          <p className="text-foreground text-sm font-semibold">
            {address.recipient}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            aria-label="Editar endereço"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-9 w-9 items-center justify-center rounded-md"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <form action={deleteAddressAction}>
            <input type="hidden" name="id" value={address.id} />
            <button
              type="submit"
              aria-label="Excluir endereço"
              className="text-muted-foreground hover:bg-muted hover:text-destructive flex h-9 w-9 items-center justify-center rounded-md"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <p className="text-muted-foreground text-sm">
        {address.street}, {address.number}
        {address.complement && ` — ${address.complement}`}
        <br />
        {address.neighborhood} — {address.city}/{address.state}
        <br />
        CEP {formatCep(address.zipCode)}
      </p>

      {!address.isDefault && (
        <form action={setDefaultAddressAction}>
          <input type="hidden" name="id" value={address.id} />
          <button
            type="submit"
            className="text-primary w-fit text-xs font-medium hover:underline"
          >
            Definir como padrão
          </button>
        </form>
      )}
    </div>
  );
}
