import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { maskCpf } from "@/lib/auth/cpf";
import { formatPhone } from "@/lib/auth/phone";
import { getCurrentUser } from "@/lib/services/auth-service";

import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "Minha conta",
};

export default async function AccountOverviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/minha-conta");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
        Minha conta
      </h1>

      <div className="border-border grid grid-cols-1 gap-4 rounded-xl border p-5 sm:grid-cols-2">
        <div>
          <p className="text-muted-foreground text-xs">E-mail</p>
          <p className="text-foreground text-sm font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">CPF</p>
          <p className="text-foreground text-sm font-medium">
            {maskCpf(user.cpf)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Telefone</p>
          <p className="text-foreground text-sm font-medium">
            {formatPhone(user.phone)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Cliente desde</p>
          <p className="text-foreground text-sm font-medium">
            {new Date(user.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      <div className="border-border rounded-xl border p-5">
        <h2 className="text-foreground mb-4 text-lg font-semibold">
          Editar dados
        </h2>
        <ProfileForm name={user.name} phone={user.phone} />
      </div>
    </div>
  );
}
