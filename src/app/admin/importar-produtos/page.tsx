import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { TOP_TIRE_BRANDS } from "@/lib/catalog/top-brands";
import { ImportForm } from "./import-form";

export const metadata: Metadata = {
  title: "Importar produtos — Admin",
  robots: { index: false, follow: false },
};

export default function ImportProductsPage() {
  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-12">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Importar produtos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aceita CSV, JSON ou XML. Cada linha é validada antes de qualquer gravação: marca precisa
          estar entre as 10 prioritárias ({TOP_TIRE_BRANDS.join(", ")}), e nenhuma marca pode passar
          de 2 modelos para a mesma medida.
        </p>
      </div>

      <ImportForm />
    </Container>
  );
}
