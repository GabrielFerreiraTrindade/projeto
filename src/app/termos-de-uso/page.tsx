import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Termos de uso",
  description: "Condições de uso do site e das compras realizadas.",
};

const sections = [
  {
    title: "1. Aceitação dos termos",
    body: `Ao acessar e usar o site da ${siteConfig.name}, você concorda com estes termos de uso. Se não concordar com alguma condição aqui descrita, pedimos que não utilize o site.`,
  },
  {
    title: "2. Cadastro e conta",
    body: "Para finalizar uma compra é necessário criar uma conta com dados verdadeiros e atualizados. Você é responsável por manter a confidencialidade da sua senha e por todas as atividades realizadas na sua conta.",
  },
  {
    title: "3. Pedidos e pagamento",
    body: "Um pedido só é confirmado após a aprovação do pagamento, feito via Pix, boleto ou cartão de crédito. Nos reservamos o direito de cancelar pedidos em caso de indisponibilidade de estoque ou suspeita de fraude, com reembolso integral quando aplicável.",
  },
  {
    title: "4. Preços e disponibilidade",
    body: "Preços, condições de pagamento e disponibilidade dos produtos podem mudar sem aviso prévio. Em caso de erro evidente de preço, nos reservamos o direito de cancelar o pedido, informando o cliente e realizando o estorno.",
  },
  {
    title: "5. Propriedade intelectual",
    body: `Marca, logotipo e conteúdo original produzido pela ${siteConfig.name} são de sua propriedade e não podem ser reproduzidos sem autorização. Fotos e descrições de produtos usadas com permissão de fabricantes e parceiros pertencem aos seus respectivos donos.`,
  },
  {
    title: "6. Alterações nestes termos",
    body: "Estes termos podem ser atualizados a qualquer momento. A versão vigente é sempre a publicada nesta página.",
  },
];

export default function TermosDeUsoPage() {
  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-12">
      <h1 className="text-foreground text-2xl font-bold sm:text-3xl">Termos de uso</h1>

      <div className="flex max-w-2xl flex-col gap-6">
        {sections.map((section) => (
          <div key={section.title} className="flex flex-col gap-2">
            <h2 className="text-foreground text-base font-semibold">{section.title}</h2>
            <p className="text-foreground text-sm leading-relaxed sm:text-base">{section.body}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}
