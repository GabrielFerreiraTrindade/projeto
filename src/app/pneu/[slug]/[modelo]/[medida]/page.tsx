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
import { parseSizeSlug } from "@/lib/catalog/size-slug";
import { siteConfig } from "@/lib/constants";
import { faqItems } from "@/lib/mock-data";
import { tireRepository } from "@/lib/repositories/tire-repository";
import {
  buildProductJsonLd,
  getProductReviews,
  getRelatedProducts,
  getSameBrandProducts,
  getSameSizeProducts,
} from "@/lib/services/product-detail-service";

// O segmento de pasta precisa se chamar [slug] (não [marca]) porque o Next
// exige o mesmo nome de parâmetro dinâmico em todas as rotas que compartilham
// a mesma posição — e /pneu/[slug]/page.tsx já usa "slug" nessa posição. Aqui
// o valor recebido é, na prática, o slug da marca.
type PageParams = { slug: string; modelo: string; medida: string };

async function resolveTire(params: PageParams) {
  const size = parseSizeSlug(params.medida);
  if (!size) return null;
  return tireRepository.findByBrandModelSize(
    params.slug,
    params.modelo,
    size.width,
    size.aspectRatio,
    size.rimDiameter,
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const tire = await resolveTire(resolvedParams);

  if (!tire) {
    return { title: "Produto não encontrado" };
  }

  const canonicalUrl = `${siteConfig.url}/pneu/${resolvedParams.slug}/${resolvedParams.modelo}/${resolvedParams.medida}`;
  const description = tire.description || `${tire.name} — medida ${tire.size}.`;

  return {
    title: tire.name,
    description,
    alternates: { canonical: canonicalUrl },
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

// URL de SEO no formato /pneu/[marca]/[modelo]/[medida] (ex:
// /pneu/pirelli/cinturato-p1/185-65-r15). É a URL canônica do catálogo
// importado; /pneu/[slug] (produto único) continua funcionando —
// compatibilidade com o que já estava linkado antes desta etapa — e aponta
// para o mesmo produto.
export default async function ProductByBrandModelSizePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const resolvedParams = await params;
  const tire = await resolveTire(resolvedParams);

  if (!tire) {
    notFound();
  }

  const brandSlug = resolvedParams.slug;
  const canonicalUrl = `${siteConfig.url}/pneu/${brandSlug}/${resolvedParams.modelo}/${resolvedParams.medida}`;
  const [sameSize, sameBrand, related] = await Promise.all([
    getSameSizeProducts(tire),
    getSameBrandProducts(tire),
    getRelatedProducts(tire),
  ]);
  const reviews = getProductReviews(tire);
  const jsonLd = buildProductJsonLd(tire, canonicalUrl);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: siteConfig.url },
      {
        "@type": "ListItem",
        position: 2,
        name: tire.brand,
        item: `${siteConfig.url}/pneu/${brandSlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tire.model,
        item: `${siteConfig.url}/pneu/${brandSlug}/${resolvedParams.modelo}`,
      },
      { "@type": "ListItem", position: 4, name: tire.size, item: canonicalUrl },
    ],
  };

  return (
    <Container className="flex flex-col gap-12 py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        Início / {tire.brand} / {tire.model} / {tire.size}
      </nav>

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
