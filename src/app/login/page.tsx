import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Container } from "@/components/ui/container";
import { getCurrentUser } from "@/lib/services/auth-service";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entre na sua conta para acompanhar pedidos e endereços.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const user = await getCurrentUser();
  const { redirect: redirectParam } = await searchParams;
  if (user) redirect("/minha-conta");

  return (
    <Container className="flex flex-col items-center py-12 sm:py-16">
      <div className="border-border w-full max-w-md rounded-xl border p-6 sm:p-8">
        <h1 className="text-foreground mb-6 text-2xl font-bold">Entrar</h1>
        <LoginForm redirectTo={redirectParam ?? "/minha-conta"} />
      </div>
    </Container>
  );
}
