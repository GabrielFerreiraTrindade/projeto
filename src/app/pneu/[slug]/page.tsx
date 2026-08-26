import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/container";
import { ProductDescription } from "@/components/product/product-description";
import { ProductFaq } from "@/components/product/product-faq";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { ProductReviews } from "@/components/product/product-reviews";
import { ProductSpecs } from "@/components/product/product-specs";
import { RelatedProducts } from "@/components/product/related-products";
import { siteConfig } from "@/lib/constants";
import { faqItems } from "@/lib/mock-data";
import {
  buildProductJsonLd,
  getProductBySlug,
  getProductReviews,
  getRelatedProducts,
  getSameBrandProducts,
  getSameSizeProducts,
} from "@/lib/services/product-detail-service";

type PageParams = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tire = await getProductBySlug(slug);

  if (!tire) {
    return { title: "Produto não encontrado" };
  }

  const canonicalUrl = `${siteConfig.url}/pneu/${tire.slug}`;
  const description = tire.description ?? `${tire.name} — medida ${tire.size}.`;

  return {
    title: tire.name,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      title: tire.name,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: "pt_BR",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const tire = await getProductBySlug(slug);

  if (!tire) {
    notFound();
  }

  const canonicalUrl = `${siteConfig.url}/pneu/${tire.slug}`;
  const [sameSize, sameBrand, related] = await Promise.all([
    getSameSizeProducts(tire),
    getSameBrandProducts(tire),
    getRelatedProducts(tire),
  ]);
  const reviews = getProductReviews(tire);
  const jsonLd = buildProductJsonLd(tire, canonicalUrl);

  return (
    <Container className="flex flex-col gap-12 py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          productName={tire.name}
          isOffer={tire.isOffer}
          images={tire.images}
        />
        <ProductInfo tire={tire} />
      </div>

      <ProductSpecs tire={tire} />
      <ProductDescription description={tire.description} />
      <ProductReviews
        rating={tire.rating}
        reviewCount={tire.reviewCount}
        reviews={reviews}
      />
      <ProductFaq items={faqItems} />

      <RelatedProducts title="Produtos relacionados" products={related} />
      <RelatedProducts title="Pneus da mesma medida" products={sameSize} />
      <RelatedProducts title="Pneus da mesma marca" products={sameBrand} />
    </Container>
  );
}
