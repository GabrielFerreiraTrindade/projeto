import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { TOP_TIRE_BRANDS } from "@/lib/catalog/top-brands";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Marcas",
  description: "Pneus das principais marcas do mercado, com estoque próprio.",
};

export default async function MarcasPage() {
  const brands = await prisma.brand.findMany({
    where: { name: { in: [...TOP_TIRE_BRANDS] } },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
  const byName = new Map(brands.map((brand) => [brand.name, brand]));

  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-12">
      <div>
        <h1 className="text-foreground text-2xl font-bold sm:text-3xl">Marcas</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Trabalhamos com {TOP_TIRE_BRANDS.length} marcas prioritárias.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {TOP_TIRE_BRANDS.map((name) => {
          const brand = byName.get(name);
          return (
            <Link
              key={name}
              href={brand ? `/marcas/${brand.slug}` : "#"}
              className="border-border hover:border-accent flex flex-col items-center gap-2 rounded-xl border p-6 text-center transition-colors"
            >
              <span className="text-foreground text-lg font-bold">{name}</span>
              <span className="text-muted-foreground text-xs">
                {brand?._count.products ?? 0} produtos
              </span>
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
