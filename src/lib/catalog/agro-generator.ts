import { AGRO_MODEL_LINES } from "@/lib/catalog/agro-model-lines";
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

// Gera o catálogo de pneus agrícolas/OTR — formato radial métrico
// (largura/perfil R aro), mesmo esquema de carro/caminhão.
export function generateAgroCatalog(): GeneratedProduct[] {
  const products: GeneratedProduct[] = [];
  const rankingByBrandSize = new Map<string, number>();

  for (const line of AGRO_MODEL_LINES) {
    for (const size of line.sizes) {
      const sizeKeyForRanking = `${line.brandName}__${size.width}-${size.aspectRatio}-${size.rim}`;
      const currentCount = rankingByBrandSize.get(sizeKeyForRanking) ?? 0;
      if (currentCount >= MAX_MODELS_PER_BRAND_PER_SIZE) continue;
      const rankingPosition: RankingPosition = currentCount === 0 ? "FIRST" : "SECOND";
      rankingByBrandSize.set(sizeKeyForRanking, currentCount + 1);

      const brandSlug = slugify(line.brandName);
      const modelSlug = slugify(line.modelName);
      const sizeSlug = `${size.width}-${size.aspectRatio}-r${size.rim}`;
      const slug = `${brandSlug}-${modelSlug}-${sizeSlug}-agro`;
      const key = `${size.width}/${size.aspectRatio} R${size.rim}`;
      const price = toCharmPrice(size.price);
      const compareAtPrice = line.positioning === "premium" ? toCharmPrice(price * 1.1) : null;

      products.push({
        sku: `${brandSlug}-${modelSlug}-${sizeSlug}-agro-${rankingPosition}`.toUpperCase(),
        slug,
        name: `Pneu Agrícola ${line.brandName} ${line.modelName} ${key}`,
        description: `Este pneu agrícola possui medida ${key}, índice de carga ${size.loadIndex} e índice de velocidade ${size.speedIndex}.`,
        brandName: line.brandName,
        tireModelName: line.modelName,
        tireModelSlug: modelSlug,
        width: size.width,
        aspectRatio: size.aspectRatio,
        rim: size.rim,
        loadIndex: size.loadIndex,
        speedIndex: size.speedIndex,
        runFlat: false,
        vehicleType: "AGRICULTURAL",
        categorySlug: "agricola-e-otr",
        price,
        compareAtPrice,
        imageStatus: "PENDING_PERMISSION",
        source: `Linha de produto real da marca, verificada em varejista brasileiro (ver agro-model-lines.ts). ${
          size.priceConfirmed ? "Preço confirmado em varejo." : "Preço estimado por comparação com cotação confirmada de pneu agrícola de porte semelhante — não é uma cotação exata desta medida."
        } Estoque é fictício (dado de teste).`,
        sourceUrl: null,
        rankingPosition,
        packQuantity: 1,
        stockQuantity: 4,
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
            "Volume de vendas não disponível publicamente. Segmento agrícola/OTR pesquisado pela primeira vez nesta rodada.",
        },
        sourceEvidence: `${line.evidence}${size.confirmed ? "" : " Índice de carga/velocidade não confirmado para esta medida específica — usado o índice padrão da medida."}`,
      });
    }
  }

  return products;
}
