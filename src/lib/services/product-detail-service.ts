import { reviews as allReviews } from "@/lib/mock-data";
import { tireRepository } from "@/lib/repositories/tire-repository";
import type { Availability, Review, Tire } from "@/types/catalog";

// Camada de serviço da página de produto: busca o pneu, monta as listas de
// relacionados (mesma medida, mesma marca, mesma aplicação) e as avaliações.
// Não sabe nada sobre React nem sobre como os dados são armazenados.

const RELATED_LIMIT = 4;

export async function getProductBySlug(slug: string): Promise<Tire | null> {
  return tireRepository.findBySlug(slug);
}

export async function getSameSizeProducts(tire: Tire): Promise<Tire[]> {
  const sameProfile = await tireRepository.findByWidthAndProfile({
    width: tire.width,
    aspectRatio: tire.aspectRatio,
  });
  return sameProfile
    .filter(
      (item) => item.rimDiameter === tire.rimDiameter && item.id !== tire.id,
    )
    .slice(0, RELATED_LIMIT);
}

export async function getSameBrandProducts(tire: Tire): Promise<Tire[]> {
  return tireRepository.findByBrand(tire.brand, tire.id, RELATED_LIMIT);
}

export async function getRelatedProducts(tire: Tire): Promise<Tire[]> {
  return tireRepository.findByCategory(tire.category, tire.id, RELATED_LIMIT);
}

export function getProductReviews(tire: Tire): Review[] {
  return allReviews.filter((review) => review.productName === tire.name);
}

const AVAILABILITY_SCHEMA_MAP: Record<Availability, string> = {
  in_stock: "https://schema.org/InStock",
  low_stock: "https://schema.org/LimitedAvailability",
  out_of_stock: "https://schema.org/OutOfStock",
};

/** Monta o JSON-LD (schema.org/Product) para SEO. */
export function buildProductJsonLd(tire: Tire, canonicalUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: tire.name,
    description: tire.description,
    sku: tire.id,
    brand: {
      "@type": "Brand",
      name: tire.brand,
    },
    ...(tire.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: tire.rating,
        reviewCount: tire.reviewCount,
      },
    }),
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "BRL",
      price: tire.price.toFixed(2),
      availability: AVAILABILITY_SCHEMA_MAP[tire.availability],
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}
