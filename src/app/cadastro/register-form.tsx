"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCpf } from "@/lib/auth/cpf";
import { formatPhone } from "@/lib/auth/phone";

import { registerAction } from "./actions";

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

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    undefined,
  );
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field id="name" label="Nome completo">
        <Input id="name" name="name" required autoComplete="name" />
      </Field>

      <Field id="cpf" label="CPF">
        <Input
          id="cpf"
          name="cpf"
          value={cpf}
          onChange={(event) => setCpf(formatCpf(event.target.value))}
          required
          inputMode="numeric"
          placeholder="000.000.000-00"
        />
      </Field>

      <Field id="email" label="E-mail">
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </Field>

      <Field id="phone" label="Telefone">
        <Input
          id="phone"
          name="phone"
          value={phone}
          onChange={(event) => setPhone(formatPhone(event.target.value))}
          required
          inputMode="numeric"
          placeholder="(31) 90000-0000"
        />
      </Field>

      <Field id="password" label="Senha">
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </Field>

      <Field id="confirmPassword" label="Confirmar senha">
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </Field>

      <p className="text-muted-foreground text-xs">
        A senha precisa ter pelo menos 8 caracteres.
      </p>

      {state?.error && (
        <p className="text-destructive text-sm">{state.error}</p>
      )}

      <Button type="submit" size="lg" disabled={isPending} className="w-full">
        {isPending ? "Criando conta..." : "Criar conta"}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="text-primary font-medium hover:underline"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
