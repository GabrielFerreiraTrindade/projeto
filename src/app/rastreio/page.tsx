import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch } from "lucide-react";

import { Container } from "@/components/ui/container";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { WHATSAPP_LINK } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Rastrear pedido",
  description: "Acompanhe o status do seu pedido pelo site ou pelo WhatsApp.",
};

export default function RastreioPage() {
  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-12">
      <div>
        <h1 className="text-foreground text-2xl font-bold sm:text-3xl">Rastrear pedido</h1>
        <p className="text-muted-foreground mt-1 max-w-xl text-sm sm:text-base">
          Você pode acompanhar o andamento do seu pedido de duas formas.
        </p>
      </div>

      <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="border-border flex flex-col gap-3 rounded-2xl border p-6">
          <span className="bg-secondary text-foreground flex h-12 w-12 items-center justify-center rounded-full">
            <PackageSearch className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="text-foreground font-semibold">Pelo site</h2>
          <p className="text-muted-foreground text-sm">
            Acesse Meus Pedidos com a sua conta e veja o status atualizado de cada compra.
          </p>
          <Link
            href="/minha-conta/pedidos"
            className="border-border text-foreground mt-auto inline-flex w-fit items-center rounded-full border px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            Ver meus pedidos
          </Link>
        </div>

        <div className="border-border flex flex-col gap-3 rounded-2xl border p-6">
          <span className="bg-[#25D366] flex h-12 w-12 items-center justify-center rounded-full text-white">
            <WhatsAppIcon className="h-6 w-6" />
          </span>
          <h2 className="text-foreground font-semibold">Pelo WhatsApp</h2>
          <p className="text-muted-foreground text-sm">
            Chame a gente informando o número do pedido e te contamos onde ele está.
          </p>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] mt-auto inline-flex w-fit items-center rounded-full px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Rastrear pelo WhatsApp
          </a>
        </div>
      </div>
    </Container>
  );
}
