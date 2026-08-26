"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { loginAction } from "./actions";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-foreground text-sm font-medium">
          E-mail
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-foreground text-sm font-medium"
          >
            Senha
          </label>
          <Link
            href="/recuperar-senha"
            className="text-primary text-xs font-medium hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>

      {state?.error && (
        <p className="text-destructive text-sm">{state.error}</p>
      )}

      <Button type="submit" size="lg" disabled={isPending} className="w-full">
        {isPending ? "Entrando..." : "Entrar"}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Ainda não tem conta?{" "}
        <Link
          href="/cadastro"
          className="text-primary font-medium hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
}
