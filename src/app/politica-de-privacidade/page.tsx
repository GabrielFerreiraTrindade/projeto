import type { Metadata } from "next";

import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: "Como tratamos os seus dados pessoais e de pagamento.",
};

export default function PoliticaDePrivacidadePage() {
  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-12">
      <h1 className="text-foreground text-2xl font-bold sm:text-3xl">Política de privacidade</h1>

      <div className="text-foreground flex max-w-2xl flex-col gap-4 text-sm leading-relaxed sm:text-base">
        <p>
          Os dados pessoais de endereçamento, pagamento e conteúdo do pedido não serão utilizados
          para outros fins que não o de processamento dos pedidos realizados. Sendo assim, suas
          informações estão resguardadas.
        </p>
        <p>
          Com relação à segurança no tráfego de dados, toda transação que envolve pagamento, seja
          por cartão de crédito ou não, é encriptada com a tecnologia SSL (Secure Socket Layer).
          Isso significa que somente nossa empresa terá acesso a estes dados. A tecnologia SSL
          criptografa todas as informações trafegadas, de modo que não possam ser lidas ou
          alteradas por terceiros enquanto estão transitando pela internet. É o mesmo tipo de
          segurança usado pelos melhores sites de home banking.
        </p>
        <p>
          Todas as informações cadastrais e financeiras são enviadas em modo seguro, o que pode
          ser facilmente verificado no navegador, que exibirá um cadeado fechado na área externa.
        </p>
      </div>
    </Container>
  );
}
