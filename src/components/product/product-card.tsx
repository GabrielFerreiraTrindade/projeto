import Link from "next/link";
import Image from "next/image";
import { Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/catalog";

import { AddToCartButton } from "./add-to-cart-button";
import { ProductImagePlaceholder } from "./product-image-placeholder";

export function ProductCard({ product }: { product: Product }) {
  const {
    id,
    slug,
    name,
    brand,
    size,
    price,
    compareAtPrice,
    installments,
    rating,
    reviewCount,
    isOffer,
    freeShipping,
    availability,
    images,
  } = product;
  const thumbnail = images?.[0];

  const discountPercent = compareAtPrice
    ? Math.round((1 - price / compareAtPrice) * 100)
    : null;

  return (
    <article className="group border-border bg-background flex h-full flex-col overflow-hidden rounded-xl border transition-shadow hover:shadow-md">
      <Link
        href={`/pneu/${slug}`}
        className="bg-white text-muted-foreground relative flex aspect-square items-center justify-center p-8"
      >
        {isOffer && (
          <Badge
            variant="default"
            className="bg-accent text-accent-foreground absolute top-3 left-3"
          >
            Oferta
          </Badge>
        )}
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={name}
            fill
            sizes="(min-width: 1024px) 240px, 45vw"
            className="object-contain p-4"
          />
        ) : (
          <ProductImagePlaceholder className="h-full w-full" />
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {brand}
        </span>

        <Link href={`/pneu/${slug}`}>
          <h3 className="text-foreground line-clamp-2 text-sm font-semibold">
            {name}
          </h3>
        </Link>

        <span className="text-muted-foreground text-xs">Medida {size}</span>

        <Rating value={rating} reviewCount={reviewCount} />

        <div className="mt-1 flex flex-col gap-0.5">
          {compareAtPrice && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs line-through">
                {formatCurrency(compareAtPrice)}
              </span>
              {discountPercent !== null && discountPercent > 0 && (
                <Badge
                  variant="default"
                  className="bg-accent text-accent-foreground"
                >
                  -{discountPercent}%
                </Badge>
              )}
            </div>
          )}
          <span className="text-foreground text-xl font-bold">
            {formatCurrency(price)}
          </span>
          {installments && (
            <span className="text-muted-foreground text-xs">
              ou {installments.count}x de {formatCurrency(installments.value)}{" "}
              sem juros
            </span>
          )}
        </div>

        {freeShipping && (
          <div className="text-primary flex items-center gap-1.5 text-xs font-medium">
            <Truck className="h-3.5 w-3.5" aria-hidden />
            Frete grátis
          </div>
        )}

        <AddToCartButton
          productId={id}
          disabled={availability === "out_of_stock"}
          className="mt-auto w-full"
          size="md"
        />
      </div>
    </article>
  );
}
