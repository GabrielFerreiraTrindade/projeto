import { toCharmPrice } from "@/lib/catalog/pricing";
import { generateCatalog } from "@/lib/catalog/catalog-generator";
import type { GeneratedProduct } from "@/lib/catalog/catalog-generator";

const DIACRITICS_PATTERN = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Kit = o mesmo pneu de passeio já cadastrado individualmente (categoria
// "carro"), vendido em pacote de 2 ou 4 unidades — pedido explícito do
// cliente. Cada tamanho de kit tem um desconto padrão de embalagem sobre o
// preço unitário (não é uma pesquisa de mercado por modelo, é a mesma
// prática de "kit com desconto" comum em loja de pneu — o preço "avulso"
// aparece riscado via compareAtPrice).
const KIT_SIZES: { quantity: 2 | 4; discount: number; stockQuantity: number }[] = [
  { quantity: 2, discount: 0.05, stockQuantity: 6 },
  { quantity: 4, discount: 0.08, stockQuantity: 3 },
];

export function generateKitCatalog(): GeneratedProduct[] {
  const baseProducts = generateCatalog().filter((product) => product.categorySlug === "carro");
  const products: GeneratedProduct[] = [];

  for (const base of baseProducts) {
    const sizeKey = `${base.width}/${base.aspectRatio} R${base.rim}`;

    for (const kit of KIT_SIZES) {
      const listPrice = base.price * kit.quantity;
      const price = toCharmPrice(listPrice * (1 - kit.discount));
      const compareAtPrice = toCharmPrice(listPrice);

      products.push({
        sku: `${base.sku}-KIT${kit.quantity}`,
        slug: `${base.slug}-kit-${kit.quantity}`,
        name: `Kit ${kit.quantity} Pneus ${base.brandName} ${base.tireModelName} ${sizeKey}`,
        description: `Kit com ${kit.quantity} unidades do pneu ${base.brandName} ${base.tireModelName} ${sizeKey}, mesma medida, índice de carga ${base.loadIndex} e índice de velocidade ${base.speedIndex} do produto vendido avulso.`,
        brandName: base.brandName,
        tireModelName: base.tireModelName,
        tireModelSlug: base.tireModelSlug,
        width: base.width,
        aspectRatio: base.aspectRatio,
        rim: base.rim,
        loadIndex: base.loadIndex,
        speedIndex: base.speedIndex,
        runFlat: base.runFlat,
        vehicleType: base.vehicleType,
        categorySlug: "kit-de-pneus",
        price,
        compareAtPrice,
        imageStatus: "OWN",
        source: `Kit comercial do mesmo modelo/medida já cadastrado avulso no catálogo (ver produto individual para a evidência da linha/medida). Imagem composta localmente a partir da foto autorizada do produto avulso (${kit.quantity} unidades lado a lado), pra representar o kit. Desconto de ${Math.round(kit.discount * 100)}% sobre o preço avulso é uma prática padrão de embalagem, não uma pesquisa de preço por modelo.`,
        sourceUrl: base.sourceUrl,
        rankingPosition: base.rankingPosition,
        packQuantity: kit.quantity,
        stockQuantity: kit.stockQuantity,
        score: base.score,
        sourceEvidence: base.sourceEvidence,
      });
    }
  }

  return products;
}

export function kitImagePath(brandName: string, tireModelSlug: string, quantity: number): string {
  return `/product-images/${slugify(brandName)}/${tireModelSlug}/kit${quantity}.png`;
}
