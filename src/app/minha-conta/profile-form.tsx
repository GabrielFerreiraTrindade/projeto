"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPhone } from "@/lib/auth/phone";

import { updateProfileAction } from "./actions";

export function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    undefined,
  );
  const [phoneValue, setPhoneValue] = useState(formatPhone(phone));

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-foreground text-sm font-medium">
          Nome completo
        </label>
        <Input id="name" name="name" defaultValue={name} required />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-foreground text-sm font-medium">
          Telefone
        </label>
        <Input
          id="phone"
          name="phone"
          value={phoneValue}
          onChange={(event) => setPhoneValue(formatPhone(event.target.value))}
          required
          inputMode="numeric"
        />
      </div>

      {state?.error && (
        <p className="text-destructive text-sm">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-primary text-sm">Dados atualizados com sucesso.</p>
      )}

      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}
