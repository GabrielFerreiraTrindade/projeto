import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Trocas e devoluções",
  description: "Como solicitar troca ou devolução de um pedido.",
};

export default function TrocasEDevolucoesPage() {
  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-12">
      <h1 className="text-foreground text-2xl font-bold sm:text-3xl">Trocas e devoluções</h1>

      <div className="text-foreground flex max-w-2xl flex-col gap-4 text-sm leading-relaxed sm:text-base">
        <p>
          Se o pneu chegar com algum defeito, ou se você simplesmente não quiser mais o produto,
          você pode solicitar a devolução em até <strong>7 dias</strong> após o recebimento do
          pedido.
        </p>
        <p>
          Para solicitar, entre em contato com a nossa{" "}
          <Link href="/atendimento" className="text-foreground font-medium hover:underline">
            central de atendimento
          </Link>{" "}
          pelo WhatsApp, informando o número do pedido e o motivo da devolução. Vamos te orientar
          sobre os próximos passos, incluindo a coleta do produto quando necessário.
        </p>
        <p>
          Produtos devolvidos por arrependimento (quando não há defeito) precisam estar sem uso e
          na embalagem original. Em caso de defeito, o produto é analisado e, confirmado o
          problema, você pode escolher entre troca ou reembolso.
        </p>
      </div>
    </Container>
  );
}
