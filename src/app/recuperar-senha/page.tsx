import type { Metadata } from "next";

import { Container } from "@/components/ui/container";

import { RequestResetForm } from "./request-reset-form";

export const metadata: Metadata = {
  title: "Recuperar senha",
};

export default function RequestPasswordResetPage() {
  return (
    <Container className="flex flex-col items-center py-12 sm:py-16">
      <div className="border-border w-full max-w-md rounded-xl border p-6 sm:p-8">
        <h1 className="text-foreground mb-2 text-2xl font-bold">
          Recuperar senha
        </h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Informe o e-mail da sua conta para receber um link de redefinição de
          senha.
        </p>
        <RequestResetForm />
      </div>
    </Container>
  );
}
