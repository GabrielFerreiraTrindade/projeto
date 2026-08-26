import { TRUCK_MODEL_LINES } from "@/lib/catalog/truck-model-lines";
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

// Gera o catálogo de pneus de caminhão/ônibus — aro fracionário (ex: 22.5"),
// índice de carga duplo (uso simples/duplo, ex: "149/146L").
export function generateTruckCatalog(): GeneratedProduct[] {
  const products: GeneratedProduct[] = [];
  const rankingByBrandSize = new Map<string, number>();

  for (const line of TRUCK_MODEL_LINES) {
    for (const size of line.sizes) {
      const sizeKeyForRanking = `${line.brandName}__${size.width}-${size.aspectRatio}-${size.rim}`;
      const currentCount = rankingByBrandSize.get(sizeKeyForRanking) ?? 0;
      if (currentCount >= MAX_MODELS_PER_BRAND_PER_SIZE) continue;
      const rankingPosition: RankingPosition = currentCount === 0 ? "FIRST" : "SECOND";
      rankingByBrandSize.set(sizeKeyForRanking, currentCount + 1);

      const brandSlug = slugify(line.brandName);
      const modelSlug = slugify(line.modelName);
      const sizeSlug = `${size.width}-${size.aspectRatio}-r${size.rim}`;
      const slug = `${brandSlug}-${modelSlug}-${sizeSlug}-caminhao`;
      const key = `${size.width}/${size.aspectRatio} R${size.rim}`;
      const price = toCharmPrice(size.price);
      const compareAtPrice = line.positioning === "premium" ? toCharmPrice(price * 1.1) : null;

      products.push({
        sku: `${brandSlug}-${modelSlug}-${sizeSlug}-caminhao-${rankingPosition}`.toUpperCase(),
        slug,
        name: `Pneu Caminhão ${line.brandName} ${line.modelName} ${key}`,
        description: `Este pneu de caminhão/ônibus possui medida ${key}, índice de carga ${size.loadIndex} e índice de velocidade ${size.speedIndex}.`,
        brandName: line.brandName,
        tireModelName: line.modelName,
        tireModelSlug: modelSlug,
        width: size.width,
        aspectRatio: size.aspectRatio,
        rim: size.rim,
        loadIndex: size.loadIndex,
        speedIndex: size.speedIndex,
        runFlat: false,
        vehicleType: "TRUCK_BUS",
        categorySlug: "caminhao-e-onibus",
        price,
        compareAtPrice,
        imageStatus: "PENDING_PERMISSION",
        source: "Linha de produto real da marca, verificada em catálogo oficial/varejistas. Preço pesquisado em varejo real (ver truck-model-lines.ts); estoque é fictício (dado de teste).",
        sourceUrl: null,
        rankingPosition,
        packQuantity: 1,
        stockQuantity: 8,
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
            "Volume de vendas não disponível publicamente. Segmento de caminhão/ônibus pesquisado pela primeira vez nesta rodada.",
        },
        sourceEvidence: `${line.evidence}${size.confirmed ? "" : " Índice de carga/velocidade não confirmado para esta medida específica com esta marca — usado o índice padrão da medida."}`,
      });
    }
  }

  return products;
}
