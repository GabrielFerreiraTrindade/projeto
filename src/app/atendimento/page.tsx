import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail } from "lucide-react";

import { Container } from "@/components/ui/container";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { WHATSAPP_LINK, WHATSAPP_PHONE_LABEL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Central de atendimento",
  description: "Fale com a gente pelo WhatsApp para tirar dúvidas sobre produtos e pedidos.",
};

export default function AtendimentoPage() {
  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-12">
      <div>
        <h1 className="text-foreground text-2xl font-bold sm:text-3xl">Central de atendimento</h1>
        <p className="text-muted-foreground mt-1 max-w-xl text-sm sm:text-base">
          Prefere falar direto com a gente? Nosso atendimento é feito pelo WhatsApp — rápido, sem
          burocracia.
        </p>
      </div>

      <div className="border-border bg-secondary flex max-w-xl flex-col items-start gap-4 rounded-2xl border p-6 sm:p-8">
        <span className="bg-[#25D366] flex h-14 w-14 items-center justify-center rounded-full text-white">
          <WhatsAppIcon className="h-7 w-7" />
        </span>
        <div>
          <h2 className="text-foreground text-lg font-semibold">Atendimento por WhatsApp</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Fale com a gente sobre dúvidas de produto, pedido, entrega ou qualquer outro assunto.
          </p>
        </div>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Chamar no WhatsApp — {WHATSAPP_PHONE_LABEL}
        </a>
      </div>

      <div className="flex max-w-xl flex-col gap-3 text-sm">
        <div className="text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 shrink-0" aria-hidden />
          Atendimento de segunda a sábado.
        </div>
        <div className="text-muted-foreground flex items-center gap-2">
          <Mail className="h-4 w-4 shrink-0" aria-hidden />
          Para pedidos já realizados, você também acompanha tudo em{" "}
          <Link href="/minha-conta/pedidos" className="text-foreground font-medium hover:underline">
            Meus Pedidos
          </Link>
          .
        </div>
      </div>
    </Container>
  );
}
