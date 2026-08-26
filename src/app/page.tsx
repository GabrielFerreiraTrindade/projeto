import { BenefitsBar } from "@/components/home/benefits-bar";
import { FaqSection } from "@/components/home/faq-section";
import { HeroBanner } from "@/components/home/hero-banner";
import { ProductSection } from "@/components/home/product-section";
import { QuickSearchSection } from "@/components/home/quick-search-section";
import { ReviewsSection } from "@/components/home/reviews-section";
import { getBestSellerProducts, getOfferProducts } from "@/lib/services/homepage-service";

export default async function Home() {
  const [offerProducts, bestSellerProducts] = await Promise.all([
    getOfferProducts(),
    getBestSellerProducts(),
  ]);

  return (
    <>
      <HeroBanner />
      <div id="busca-por-medida">
        <QuickSearchSection />
      </div>
      <ProductSection
        title="Produtos em promoção"
        description="Descontos por tempo limitado."
        products={offerProducts}
        viewAllHref="/ofertas"
      />
      <ProductSection
        title="Produtos mais vendidos"
        products={bestSellerProducts}
        tone="muted"
      />
      <BenefitsBar />
      <ReviewsSection />
      <FaqSection />
    </>
  );
}
