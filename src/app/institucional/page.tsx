import type { Metadata } from "next";

import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Sobre a loja",
  description: "Conheça a proposta da loja: pneus para todos os tipos de veículo, com atendimento personalizado.",
};

export default function InstitucionalPage() {
  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-12">
      <h1 className="text-foreground text-2xl font-bold sm:text-3xl">Sobre a loja</h1>

      <div className="text-foreground flex max-w-2xl flex-col gap-4 text-sm leading-relaxed sm:text-base">
        <p>
          Desde novembro de 2021, trabalhamos para ser uma referência de verdade no mercado de
          pneus de Minas Gerais — não só mais uma loja online. Isso significa cuidar de cada etapa
          da compra, desde o momento em que você procura a medida certa até a entrega na sua casa,
          com uma seleção ampla de produtos e marcas.
        </p>
        <p>
          Vendemos pneus para praticamente todo tipo de veículo: carro de passeio, SUV e
          caminhonete, moto, van e utilitário, caminhão e ônibus, e também equipamentos agrícolas
          e fora de estrada. Trabalhamos com marcas reconhecidas do setor, sempre pensando em
          oferecer segurança e desempenho em cada quilômetro rodado.
        </p>
        <p>
          Mais do que fechar uma venda, queremos construir uma relação de confiança com quem
          compra da gente. Por isso, nosso atendimento é pensado para te ajudar a escolher o
          produto certo para a sua necessidade, sem enrolação.
        </p>
        <p>
          Estamos aqui para fazer parte da sua rotina nas estradas de Minas Gerais: comprometidos
          em te ajudar a dirigir com mais segurança e tranquilidade, em qualquer trajeto.
        </p>
      </div>
    </Container>
  );
}
