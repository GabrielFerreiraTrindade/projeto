import { VAN_MODEL_LINES } from "@/lib/catalog/van-model-lines";
import { toCharmPrice } from "@/lib/catalog/pricing";
import { MAX_MODELS_PER_BRAND_PER_SIZE } from "@/lib/catalog/top-brands";
import type { GeneratedProduct, RankingPosition } from "@/lib/catalog/catalog-generator";

const DIACRITICS_PATTERN = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Gera o catálogo de pneus de van/utilitário. Medida sem perfil (aspectRatio
// null) — formato real desse tipo de pneu comercial (ex: "185R14C").
export function generateVanCatalog(): GeneratedProduct[] {
  const products: GeneratedProduct[] = [];
  const rankingByBrandSize = new Map<string, number>();

  for (const line of VAN_MODEL_LINES) {
    for (const size of line.sizes) {
      const sizeKeyForRanking = `${line.brandName}__${size.width}-null-${size.rim}`;
      const currentCount = rankingByBrandSize.get(sizeKeyForRanking) ?? 0;
      if (currentCount >= MAX_MODELS_PER_BRAND_PER_SIZE) continue;
      const rankingPosition: RankingPosition = currentCount === 0 ? "FIRST" : "SECOND";
      rankingByBrandSize.set(sizeKeyForRanking, currentCount + 1);

      const brandSlug = slugify(line.brandName);
      const modelSlug = slugify(line.modelName);
      const sizeSlug = `${size.width}-r${size.rim}c`;
      const slug = `${brandSlug}-${modelSlug}-${sizeSlug}-van`;
      const key = `${size.width} R${size.rim}C`;
      const price = toCharmPrice(size.price);
      const compareAtPrice = line.positioning === "premium" ? toCharmPrice(price * 1.1) : null;

      products.push({
        sku: `${brandSlug}-${modelSlug}-${sizeSlug}-van-${rankingPosition}`.toUpperCase(),
        slug,
        name: `Pneu Van ${line.brandName} ${line.modelName} ${key}`,
        description: `Este pneu comercial possui medida ${key}, índice de carga ${size.loadIndex} e índice de velocidade ${size.speedIndex}.`,
        brandName: line.brandName,
        tireModelName: line.modelName,
        tireModelSlug: modelSlug,
        width: size.width,
        aspectRatio: null,
        rim: size.rim,
        loadIndex: size.loadIndex,
        speedIndex: size.speedIndex,
        runFlat: false,
        vehicleType: "LIGHT_TRUCK",
        categorySlug: "van-e-utilitario",
        price,
        compareAtPrice,
        imageStatus: "PENDING_PERMISSION",
        source: "Linha de produto real da marca, verificada em loja oficial/varejistas. Preço estimado por ordem de grandeza de mercado (ver van-model-lines.ts); estoque é fictício (dado de teste).",
        sourceUrl: null,
        rankingPosition,
        packQuantity: 1,
        stockQuantity: 10,
        score: {
          popularity: "MEDIUM",
          salesVolume: "UNKNOWN",
          availability: "MEDIUM",
          relevance: "MEDIUM",
          distributorPresence: "MEDIUM",
          retailerPresence: "MEDIUM",
          regionalRelevance: "UNKNOWN",
          overall: "MEDIUM",
          source:
            "Volume de vendas não disponível publicamente. Segmento de van/utilitário pesquisado pela primeira vez nesta rodada.",
        },
        sourceEvidence: line.evidence,
      });
    }
  }

  return products;
}
