import type { Metadata } from "next";

import { CartPageContent } from "@/components/cart/cart-page-content";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Carrinho",
  description:
    "Revise os produtos do seu carrinho antes de finalizar a compra.",
};

export default function CartPage() {
  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-12">
      <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
        Meu carrinho
      </h1>
      <CartPageContent />
    </Container>
  );
}
