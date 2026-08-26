"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { resetPasswordAction } from "./actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-foreground text-sm font-medium"
        >
          Nova senha
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="confirmPassword"
          className="text-foreground text-sm font-medium"
        >
          Confirmar nova senha
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      {state?.error && (
        <p className="text-destructive text-sm">{state.error}</p>
      )}

      <Button type="submit" size="lg" disabled={isPending} className="w-full">
        {isPending ? "Salvando..." : "Redefinir senha"}
      </Button>
    </form>
  );
}
