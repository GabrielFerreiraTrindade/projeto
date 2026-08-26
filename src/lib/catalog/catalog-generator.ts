import { BRAND_MODEL_LINES } from "@/lib/catalog/brand-model-lines";
import { toCharmPrice } from "@/lib/catalog/pricing";
import { TIRE_SIZE_DEMAND_SEED } from "@/lib/catalog/tire-size-demand-data";
import {
  MAX_MODELS_PER_BRAND_PER_SIZE,
  TOP_TIRE_BRANDS,
} from "@/lib/catalog/top-brands";

// Gera o catálogo inicial: para cada medida pesquisada (TIRE_SIZE_DEMAND_SEED)
// e cada marca prioritária (TOP_TIRE_BRANDS), cria no máximo
// MAX_MODELS_PER_BRAND_PER_SIZE produtos (as 2 linhas fixas da marca, ver
// BRAND_MODEL_LINES). Isso já garante a regra fundamental na origem dos
// dados — a constraint @@unique([brandId, sizeId, rankingPosition]) no
// schema garante a mesma regra no banco, como segunda camada de proteção.
//
// Dados de preço/estoque são fictícios (esta é uma base de teste, não um
// catálogo com preços reais de mercado — ver seção 20 do pedido original:
// "Criar pelo menos 100 produtos fictícios para testar o sistema"). Dados
// técnicos (índice de carga/velocidade) usam uma tabela de combinações
// padrão de engenharia por medida (informação técnica genérica do setor,
// não uma ficha técnica de um fabricante específico verificada
// individualmente — isso é registrado em cada ProductSource).

export type RankingPosition = "FIRST" | "SECOND";
export type VehicleType =
  | "PASSENGER"
  | "SUV"
  | "LIGHT_TRUCK"
  | "MOTORCYCLE"
  | "TRUCK_BUS"
  | "AGRICULTURAL";
export type ImageStatus =
  | "PENDING_PERMISSION"
  | "MANUFACTURER_AUTHORIZED"
  | "LICENSED"
  | "OWN";
export type ScoreLevel = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

export type GeneratedProduct = {
  sku: string;
  slug: string;
  name: string;
  description: string;
  brandName: string;
  tireModelName: string;
  tireModelSlug: string;
  width: number;
  /** null = pneu comercial sem número de perfil (ex: van "185 R14"). */
  aspectRatio: number | null;
  rim: number;
  loadIndex: string;
  speedIndex: string;
  runFlat: boolean;
  vehicleType: VehicleType;
  categorySlug:
    | "carro"
    | "suv-caminhonete"
    | "moto"
    | "van-e-utilitario"
    | "caminhao-e-onibus"
    | "agricola-e-otr"
    | "kit-de-pneus";
  price: number;
  compareAtPrice: number | null;
  imageStatus: ImageStatus;
  source: string;
  sourceUrl: string | null;
  rankingPosition: RankingPosition;
  /** 1 = pneu avulso, 2/4 = kit do mesmo modelo+medida (categoria "kit-de-pneus"). */
  packQuantity: number;
  stockQuantity: number;
  score: {
    popularity: ScoreLevel;
    salesVolume: ScoreLevel;
    availability: ScoreLevel;
    relevance: ScoreLevel;
    distributorPresence: ScoreLevel;
    retailerPresence: ScoreLevel;
    regionalRelevance: ScoreLevel;
    overall: ScoreLevel;
    source: string;
  };
  sourceEvidence: string;
};

// Combinação padrão de índice de carga/velocidade por medida — valores
// típicos de engenharia para pneus de reposição nessa medida no segmento de
// passeio/SUV, não específicos de uma ficha técnica de fabricante
// individual verificada.
const STANDARD_LOAD_SPEED_INDEX: Record<string, { loadIndex: string; speedIndex: string }> = {
  "175/65 R14": { loadIndex: "82", speedIndex: "T" },
  "175/70 R14": { loadIndex: "84", speedIndex: "T" },
  "185/65 R15": { loadIndex: "88", speedIndex: "H" },
  "195/55 R15": { loadIndex: "85", speedIndex: "V" },
  "195/60 R15": { loadIndex: "88", speedIndex: "H" },
  "195/65 R15": { loadIndex: "91", speedIndex: "H" },
  "205/55 R16": { loadIndex: "91", speedIndex: "V" },
  "205/60 R16": { loadIndex: "92", speedIndex: "H" },
  "205/65 R15": { loadIndex: "94", speedIndex: "H" },
  "205/65 R16": { loadIndex: "95", speedIndex: "H" },
  "215/55 R17": { loadIndex: "94", speedIndex: "V" },
  "225/45 R17": { loadIndex: "91", speedIndex: "W" },
  "215/60 R17": { loadIndex: "96", speedIndex: "H" },
  "225/65 R17": { loadIndex: "102", speedIndex: "H" },
  "225/55 R18": { loadIndex: "98", speedIndex: "V" },
  "235/60 R18": { loadIndex: "107", speedIndex: "H" },
  "235/55 R19": { loadIndex: "101", speedIndex: "V" },
  "245/45 R20": { loadIndex: "103", speedIndex: "W" },
  "255/35 R20": { loadIndex: "97", speedIndex: "Y" },
  "265/45 R21": { loadIndex: "104", speedIndex: "W" },
  "265/40 R22": { loadIndex: "106", speedIndex: "Y" },
  "285/45 R22": { loadIndex: "114", speedIndex: "W" },
  "285/40 R23": { loadIndex: "111", speedIndex: "Y" },
};

const SUV_SIZES = new Set([
  "205/65 R16",
  "215/60 R17",
  "225/65 R17",
  "225/55 R18",
  "235/60 R18",
  "235/55 R19",
  "245/45 R20",
  "255/35 R20",
  "265/45 R21",
  "265/40 R22",
  "285/45 R22",
  "285/40 R23",
]);

const DIACRITICS_PATTERN = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sizeKey(width: number, aspectRatio: number, rim: number): string {
  return `${width}/${aspectRatio} R${rim}`;
}

// Preço pesquisado em varejo (PneuStore, Carrefour, Buscapé, Michelin/Continental
// oficiais, entre outros) para cada aro, separado por faixa econômica/premium —
// não é mais uma fórmula fictícia. Aro 14-16 pesquisado em pneus populares
// (175/70R14 ~R$360-400 médio; 205/55R16 de R$188 a R$400 conforme marca); aro
// 17-19 interpolado a partir dessas pontas; aro 20-23 (SUV/caminhonete grande)
// pesquisado em linhas de conforto/touring como as deste catálogo (bem abaixo
// de linhas de performance máxima tipo Pirelli PZero/Michelin Pilot Sport, que
// no varejo passam de R$2.000 — não é o segmento das linhas aqui cadastradas).
const PRICE_BY_RIM: Record<number, { economy: number; premium: number }> = {
  14: { economy: 330, premium: 400 },
  15: { economy: 370, premium: 450 },
  16: { economy: 400, premium: 480 },
  17: { economy: 480, premium: 580 },
  18: { economy: 580, premium: 700 },
  19: { economy: 680, premium: 820 },
  20: { economy: 850, premium: 1050 },
  21: { economy: 1050, premium: 1300 },
  22: { economy: 1300, premium: 1600 },
  23: { economy: 1550, premium: 1900 },
};

function basePrice(rim: number, positioning: "economy" | "premium"): number {
  const byRim = PRICE_BY_RIM[rim];
  if (!byRim) {
    throw new Error(`Faltam preços de mercado pesquisados para o aro ${rim}.`);
  }
  return toCharmPrice(positioning === "premium" ? byRim.premium : byRim.economy);
}

function scoreForCombo(
  demandScore: ScoreLevel,
  positioning: "economy" | "premium",
  hasSalesClaim: boolean,
): GeneratedProduct["score"] {
  const popularity: ScoreLevel = demandScore;
  const availability: ScoreLevel = demandScore === "LOW" ? "MEDIUM" : demandScore;
  const distributorPresence: ScoreLevel = positioning === "economy" ? "HIGH" : "MEDIUM";
  return {
    popularity,
    // Nunca inventado: só HIGH quando há uma citação explícita de "linha
    // mais vendida" (ex: Continental PowerContact 2); caso contrário
    // UNKNOWN, porque não há dado público de volume de vendas.
    salesVolume: hasSalesClaim ? "HIGH" : "UNKNOWN",
    availability,
    relevance: demandScore,
    distributorPresence,
    retailerPresence: distributorPresence,
    regionalRelevance: demandScore,
    overall: demandScore,
    source: hasSalesClaim
      ? "Ver evidência de fonte específica em ProductSource (afirmação de varejo sobre volume de vendas da linha)."
      : "Volume de vendas não disponível publicamente. Classificação baseada na demanda observada para a medida (ver TireSizeDemand) e na presença da linha em catálogos de fabricante/distribuidor (ver ProductSource).",
  };
}

export function generateCatalog(): GeneratedProduct[] {
  const products: GeneratedProduct[] = [];

  for (const sizeSeed of TIRE_SIZE_DEMAND_SEED) {
    const key = sizeKey(sizeSeed.width, sizeSeed.aspectRatio, sizeSeed.rim);
    const specs = STANDARD_LOAD_SPEED_INDEX[key];
    if (!specs) {
      throw new Error(`Faltam índices de carga/velocidade padrão para a medida ${key}.`);
    }
    const isSuvSize = SUV_SIZES.has(key);

    for (const brandName of TOP_TIRE_BRANDS) {
      const allLines = BRAND_MODEL_LINES[brandName];
      if (!allLines) {
        throw new Error(`Marca ${brandName} não tem linhas de modelo configuradas em BRAND_MODEL_LINES.`);
      }

      // Só cria produto se o aro da medida estiver dentro da faixa real da
      // linha (minRim/maxRim) — uma marca pode ter 0, 1 ou 2 modelos
      // elegíveis para uma medida, nunca mais que MAX_MODELS_PER_BRAND_PER_SIZE.
      const eligibleLines = allLines.filter(
        (line) => sizeSeed.rim >= line.minRim && sizeSeed.rim <= line.maxRim,
      );

      eligibleLines.forEach((line, index) => {
        if (index >= MAX_MODELS_PER_BRAND_PER_SIZE) {
          // Guarda defensiva: nunca deveria disparar, já que BRAND_MODEL_LINES
          // é tipado como uma tupla de exatamente 2 posições.
          return;
        }

        const rankingPosition: RankingPosition = index === 0 ? "FIRST" : "SECOND";
        const brandSlug = slugify(brandName);
        const modelSlug = slugify(line.name);
        const sizeSlug = `${sizeSeed.width}-${sizeSeed.aspectRatio}-r${sizeSeed.rim}`;
        const slug = `${brandSlug}-${modelSlug}-${sizeSlug}`;
        const price = basePrice(sizeSeed.rim, line.positioning);
        const compareAtPrice = line.positioning === "premium" ? toCharmPrice(price * 1.12) : null;
        const hasSalesClaim = brandName === "Continental" && line.positioning === "economy";

        products.push({
          sku: `${brandSlug}-${modelSlug}-${sizeSlug}-${rankingPosition}`.toUpperCase(),
          slug,
          name: `Pneu ${brandName} ${line.name} ${key}`,
          description: `Este pneu possui medida ${key}, índice de carga ${specs.loadIndex} e índice de velocidade ${specs.speedIndex}.`,
          brandName,
          tireModelName: line.name,
          tireModelSlug: modelSlug,
          width: sizeSeed.width,
          aspectRatio: sizeSeed.aspectRatio,
          rim: sizeSeed.rim,
          loadIndex: specs.loadIndex,
          speedIndex: specs.speedIndex,
          runFlat: false,
          vehicleType: isSuvSize ? "SUV" : "PASSENGER",
          categorySlug: isSuvSize ? "suv-caminhonete" : "carro",
          price,
          compareAtPrice,
          imageStatus: "PENDING_PERMISSION",
          source: "Linha de produto real da marca, verificada no site do fabricante/distribuidor. Preço e estoque são fictícios (dados de teste).",
          sourceUrl: null,
          rankingPosition,
          packQuantity: 1,
          stockQuantity: 15,
          score: scoreForCombo(sizeSeed.demandScore, line.positioning, hasSalesClaim),
          sourceEvidence: line.evidence,
        });
      });
    }
  }

  return products;
}

export function assertMaxTwoModelsPerBrandPerSize(products: GeneratedProduct[]): void {
  const counts = new Map<string, number>();
  for (const product of products) {
    const key = `${product.brandName}__${product.width}-${product.aspectRatio}-${product.rim}`;
    const next = (counts.get(key) ?? 0) + 1;
    if (next > MAX_MODELS_PER_BRAND_PER_SIZE) {
      throw new Error(
        `Regra violada: ${product.brandName} tem mais de ${MAX_MODELS_PER_BRAND_PER_SIZE} modelos para a medida ${product.width}/${product.aspectRatio} R${product.rim}.`,
      );
    }
    counts.set(key, next);
  }
}
