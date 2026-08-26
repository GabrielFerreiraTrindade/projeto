import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Redefinir senha",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <Container className="flex flex-col items-center py-12 sm:py-16">
      <div className="border-border w-full max-w-md rounded-xl border p-6 sm:p-8">
        <h1 className="text-foreground mb-6 text-2xl font-bold">
          Redefinir senha
        </h1>

        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-destructive text-sm">
              Link de redefinição inválido.
            </p>
            <Link
              href="/recuperar-senha"
              className="text-primary text-sm font-medium hover:underline"
            >
              Solicitar um novo link
            </Link>
          </div>
        )}
      </div>
    </Container>
  );
}
