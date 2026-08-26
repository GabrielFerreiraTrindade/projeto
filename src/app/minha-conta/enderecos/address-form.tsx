"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCep } from "@/lib/services/shipping-service";
import type { Address } from "@/types/account";

import type { AddressFormState } from "./actions";

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-foreground text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

export function AddressForm({
  action,
  address,
  onCancel,
}: {
  action: (
    prevState: AddressFormState,
    formData: FormData,
  ) => Promise<AddressFormState>;
  address?: Address;
  onCancel?: () => void;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const [zipCode, setZipCode] = useState(
    address ? formatCep(address.zipCode) : "",
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {address && <input type="hidden" name="id" value={address.id} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="label" label="Identificação (opcional)">
          <Input
            id="label"
            name="label"
            defaultValue={address?.label ?? ""}
            placeholder="Casa, trabalho..."
          />
        </Field>
        <Field id="recipient" label="Destinatário">
          <Input
            id="recipient"
            name="recipient"
            defaultValue={address?.recipient}
            required
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
        <Field id="street" label="Rua">
          <Input
            id="street"
            name="street"
            defaultValue={address?.street}
            required
          />
        </Field>
        <Field id="number" label="Número">
          <Input
            id="number"
            name="number"
            defaultValue={address?.number}
            required
          />
        </Field>
      </div>

      <Field id="complement" label="Complemento (opcional)">
        <Input
          id="complement"
          name="complement"
          defaultValue={address?.complement ?? ""}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="neighborhood" label="Bairro">
          <Input
            id="neighborhood"
            name="neighborhood"
            defaultValue={address?.neighborhood}
            required
          />
        </Field>
        <Field id="zipCode" label="CEP">
          <Input
            id="zipCode"
            name="zipCode"
            value={zipCode}
            onChange={(event) => setZipCode(formatCep(event.target.value))}
            required
            inputMode="numeric"
            placeholder="00000-000"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_100px]">
        <Field id="city" label="Cidade">
          <Input id="city" name="city" defaultValue={address?.city} required />
        </Field>
        <Field id="state" label="UF">
          <Input
            id="state"
            name="state"
            defaultValue={address?.state}
            required
            maxLength={2}
            className="uppercase"
          />
        </Field>
      </div>

      <label className="text-foreground flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isDefault"
          defaultChecked={address?.isDefault}
          className="border-border h-4 w-4 rounded"
        />
        Definir como endereço padrão
      </label>

      {state?.error && (
        <p className="text-destructive text-sm">{state.error}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar endereço"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
