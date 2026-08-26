import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types/catalog";

export function ProductList({
  products,
  emptyTitle = "Nenhum produto encontrado",
  emptyDescription = "Tente remover alguns filtros para ver mais resultados.",
}: {
  products: Product[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="border-border flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-12 text-center">
        <p className="text-foreground font-semibold">{emptyTitle}</p>
        <p className="text-muted-foreground text-sm">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
