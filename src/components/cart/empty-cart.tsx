import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyCart() {
  return (
    <div className="border-border flex flex-col items-center gap-4 rounded-xl border border-dashed py-16 text-center">
      <ShoppingCart className="text-muted-foreground h-10 w-10" aria-hidden />
      <div className="flex flex-col gap-1">
        <p className="text-foreground font-semibold">Seu carrinho está vazio</p>
        <p className="text-muted-foreground text-sm">
          Explore o catálogo e encontre o pneu certo para o seu veículo.
        </p>
      </div>
      <Link href="/">
        <Button>Continuar comprando</Button>
      </Link>
    </div>
  );
}
