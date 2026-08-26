import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Container } from "@/components/ui/container";
import { getCurrentUser } from "@/lib/services/auth-service";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta para acompanhar pedidos e salvar endereços.",
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/minha-conta");

  return (
    <Container className="flex flex-col items-center py-12 sm:py-16">
      <div className="border-border w-full max-w-md rounded-xl border p-6 sm:p-8">
        <h1 className="text-foreground mb-6 text-2xl font-bold">Criar conta</h1>
        <RegisterForm />
      </div>
    </Container>
  );
}
