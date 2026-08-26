"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { requestResetAction } from "./actions";

export function RequestResetForm() {
  const [state, formAction, isPending] = useActionState(
    requestResetAction,
    undefined,
  );

  if (state?.submitted) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-foreground text-sm">
          Se houver uma conta com este e-mail, enviamos um link de recuperação
          para ela.
        </p>

        {state.resetUrl && (
          <div className="border-border rounded-md border border-dashed p-3">
            <p className="text-muted-foreground mb-2 text-xs">
              Ambiente de desenvolvimento — ainda não há envio de e-mail
              configurado, então o link fica disponível aqui:
            </p>
            <a
              href={state.resetUrl}
              className="text-primary text-sm font-medium break-all hover:underline"
            >
              {state.resetUrl}
            </a>
          </div>
        )}

        <Link
          href="/login"
          className="text-primary text-center text-sm font-medium hover:underline"
        >
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-foreground text-sm font-medium">
          E-mail cadastrado
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>

      <Button type="submit" size="lg" disabled={isPending} className="w-full">
        {isPending ? "Enviando..." : "Enviar link de recuperação"}
      </Button>

      <Link
        href="/login"
        className="text-primary text-center text-sm font-medium hover:underline"
      >
        Voltar para o login
      </Link>
    </form>
  );
}
