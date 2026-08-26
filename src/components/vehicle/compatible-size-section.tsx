import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductList } from "@/components/catalog/product-list";
import { formatSizeSlug } from "@/lib/catalog/size-slug";
import type { Product, TireSize } from "@/types/catalog";

export function CompatibleSizeSection({
  size,
  sizeLabel,
  products,
  total,
}: {
  size: TireSize;
  sizeLabel: string;
  products: Product[];
  total: number;
}) {
  const catalogHref = `/pneus/${formatSizeSlug(size)}`;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-foreground text-xl font-bold">Pneus {sizeLabel}</h2>
        <Link
          href={catalogHref}
          className="text-primary flex items-center gap-1 text-sm font-medium hover:underline"
        >
          Ver todos ({total})
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <ProductList products={products} />
    </section>
  );
}
