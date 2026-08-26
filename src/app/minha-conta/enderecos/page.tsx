import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { listAddresses } from "@/lib/services/address-service";
import { getCurrentUser } from "@/lib/services/auth-service";

import { AddressCard } from "./address-card";
import { NewAddressSection } from "./new-address-section";

export const metadata: Metadata = {
  title: "Meus endereços",
};

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/minha-conta/enderecos");

  const addresses = await listAddresses(user.id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
        Meus endereços
      </h1>

      {addresses.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Você ainda não cadastrou nenhum endereço.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {addresses.map((address) => (
          <AddressCard key={address.id} address={address} />
        ))}
      </div>

      <NewAddressSection />
    </div>
  );
}
