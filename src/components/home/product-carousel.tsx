"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types/catalog";

export function ProductCarousel({ products }: { products: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByPage(direction: 1 | -1) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({ left: direction * scroller.clientWidth * 0.9, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[75%] shrink-0 snap-start sm:w-[45%] lg:w-[23%] xl:w-[18.5%]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Ver anteriores"
        onClick={() => scrollByPage(-1)}
        className="border-border bg-background text-foreground absolute top-1/2 left-0 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-md hover:bg-secondary sm:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Ver próximos"
        onClick={() => scrollByPage(1)}
        className="border-border bg-background text-foreground absolute top-1/2 right-0 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-md hover:bg-secondary sm:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
