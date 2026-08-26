import type { Metadata } from "next";

import { Pagination } from "@/components/catalog/pagination";
import { ProductList } from "@/components/catalog/product-list";
import { Container } from "@/components/ui/container";
import { listOffers } from "@/lib/services/catalog-listing-service";

export const metadata: Metadata = {
  title: "Ofertas",
  description: "Pneus com desconto por tempo limitado, entrega para todo o estado de Minas Gerais.",
};

export default async function OfertasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;
  const result = await listOffers(page);

  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-12">
      <div>
        <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
          Ofertas
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {result.total} produto{result.total === 1 ? "" : "s"} com desconto
          por tempo limitado.
        </p>
      </div>

      <ProductList
        products={result.tires}
        emptyTitle="Nenhuma oferta no momento"
        emptyDescription="Volte em breve para conferir novos descontos."
      />

      <Pagination
        basePath="/ofertas"
        searchParams={new URLSearchParams()}
        page={result.page}
        totalPages={result.totalPages}
      />
    </Container>
  );
}
