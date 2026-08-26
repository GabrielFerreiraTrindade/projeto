import { ProductList } from "@/components/catalog/product-list";
import type { Product } from "@/types/catalog";

export function RelatedProducts({
  title,
  products,
}: {
  title: string;
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-foreground text-xl font-bold">{title}</h2>
      <ProductList products={products} />
    </section>
  );
}
