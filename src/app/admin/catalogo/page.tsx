import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { getAdminCatalog, getCatalogSummary } from "@/lib/services/catalog-admin-service";
import { cn } from "@/lib/utils";
import { BulkDiscountForm } from "./bulk-discount-form";
import { ProductPriceEditor } from "./product-price-editor";

export const metadata: Metadata = {
  title: "Catálogo — Admin",
  robots: { index: false, follow: false },
};

const SCORE_LABEL: Record<string, string> = {
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
  UNKNOWN: "Não disponível",
};

const IMAGE_STATUS_LABEL: Record<string, string> = {
  PENDING_PERMISSION: "Aguardando autorização",
  MANUFACTURER_AUTHORIZED: "Autorizada pelo fabricante",
  LICENSED: "Licenciada",
  OWN: "Própria",
};

function ScoreBadge({ level }: { level: string | null }) {
  const label = level ? (SCORE_LABEL[level] ?? level) : "—";
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        level === "HIGH" && "bg-green-100 text-green-800",
        level === "MEDIUM" && "bg-amber-100 text-amber-800",
        level === "LOW" && "bg-muted text-muted-foreground",
        (level === "UNKNOWN" || !level) && "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}

export default async function AdminCatalogPage() {
  const [brands, summary] = await Promise.all([getAdminCatalog(), getCatalogSummary()]);

  return (
    <Container className="flex flex-col gap-8 py-8 sm:py-12">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Catálogo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {summary.brandCount} marcas · {summary.totalProducts} produtos ·{" "}
          {summary.pendingImages} aguardando autorização de imagem. Regra fixa: no máximo 2 modelos
          por marca em cada medida.
        </p>
      </div>

      <BulkDiscountForm />

      <div className="flex flex-col gap-10">
        {brands.map((brand) => (
          <section key={brand.brandName} className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-foreground">
              MARCA: {brand.brandName}{" "}
              <span className="font-normal text-muted-foreground">
                ({brand.totalProducts} produtos)
              </span>
            </h2>

            {brand.sizes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum produto cadastrado ainda para esta marca.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {brand.sizes.map((sizeGroup) => (
                  <div
                    key={sizeGroup.sizeLabel}
                    className="flex flex-col gap-3 rounded-xl border border-border p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-foreground">{sizeGroup.sizeLabel}</h3>
                      <ScoreBadge level={sizeGroup.demandScore} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Relevância Brasil: {SCORE_LABEL[sizeGroup.brazilRelevance ?? ""] ?? "—"} ·
                      Minas Gerais: {SCORE_LABEL[sizeGroup.minasGeraisRelevance ?? ""] ?? "—"}
                    </p>

                    <ul className="flex flex-col gap-2">
                      {sizeGroup.products.map((product) => (
                        <li
                          key={product.id}
                          className="flex items-center justify-between gap-2 rounded-lg bg-secondary px-3 py-2 text-sm"
                        >
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-foreground">
                              ✓ {product.tireModelName}
                            </span>
                            <ProductPriceEditor
                              productId={product.id}
                              price={product.price}
                              compareAtPrice={product.compareAtPrice}
                            />
                            <span className="text-xs text-muted-foreground">
                              estoque {product.stockQuantity} ·{" "}
                              {IMAGE_STATUS_LABEL[product.imageStatus] ?? product.imageStatus}
                            </span>
                          </div>
                          <ScoreBadge level={product.scoreOverall} />
                        </li>
                      ))}
                    </ul>

                    {sizeGroup.products.length >= 2 && (
                      <p className="text-xs text-muted-foreground">
                        Limite de 2 modelos por marca atingido para esta medida.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </Container>
  );
}
