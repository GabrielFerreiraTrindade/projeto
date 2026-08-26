import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Container } from "@/components/ui/container";
import { listAddresses } from "@/lib/services/address-service";
import { getCurrentUser } from "@/lib/services/auth-service";

import { CheckoutWizard } from "./checkout-wizard";

export const metadata: Metadata = {
  title: "Finalizar compra",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/checkout");

  const addresses = await listAddresses(user.id);

  return (
    <Container className="py-6 sm:py-10">
      <h1 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">
        Finalizar compra
      </h1>
      <CheckoutWizard
        user={{
          name: user.name,
          email: user.email,
          cpf: user.cpf,
          phone: user.phone,
        }}
        addresses={addresses}
      />
    </Container>
  );
}
