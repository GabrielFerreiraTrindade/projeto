import Link from "next/link";

import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types/catalog";

export function ProductSection({
  title,
  description,
  products,
  tone = "default",
  viewAllHref,
}: {
  title: string;
  description?: string;
  products: Product[];
  tone?: "default" | "muted";
  viewAllHref?: string;
}) {
  return (
    <section className={tone === "muted" ? "bg-secondary" : undefined}>
      <Container className="py-14 sm:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-foreground text-2xl font-bold">{title}</h2>
            {description && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )}
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-accent text-sm font-semibold hover:underline"
            >
              Ver todos
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
