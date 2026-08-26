import { AlertTriangle, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { Tire } from "@/types/catalog";

import { ProductBuyBox } from "./product-buy-box";
import { ShippingCalculator } from "./shipping-calculator";

export function ProductInfo({ tire }: { tire: Tire }) {
  const discountPercent = tire.compareAtPrice
    ? Math.round((1 - tire.price / tire.compareAtPrice) * 100)
    : null;
  const isOutOfStock = tire.availability === "out_of_stock";
  const isLowStock = tire.availability === "low_stock";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {tire.brand}
        </span>
        <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
          {tire.name}
        </h1>
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span>Medida {tire.size}</span>
          <span aria-hidden>·</span>
          <span>Aplicação: {CATEGORY_LABELS[tire.category]}</span>
        </div>
      </div>

      {tire.reviewCount > 0 && (
        <a href="#avaliacoes" className="w-fit">
          <Rating value={tire.rating} reviewCount={tire.reviewCount} />
        </a>
      )}

      <div className="flex flex-wrap gap-2">
        {tire.isOffer && (
          <Badge className="bg-accent text-accent-foreground">Oferta</Badge>
        )}
        {tire.freeShipping && (
          <Badge variant="outline" className="gap-1">
            <Truck className="h-3.5 w-3.5" aria-hidden />
            Frete grátis
          </Badge>
        )}
        {isLowStock && (
          <Badge className="bg-warning text-warning-foreground gap-1">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
            Últimas unidades
          </Badge>
        )}
        {isOutOfStock && (
          <Badge className="bg-destructive text-destructive-foreground">
            Produto indisponível
          </Badge>
        )}
      </div>

      <div className="border-border flex flex-col gap-1 border-y py-4">
        {tire.compareAtPrice && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm line-through">
              {formatCurrency(tire.compareAtPrice)}
            </span>
            {discountPercent !== null && discountPercent > 0 && (
              <Badge className="bg-accent text-accent-foreground">
                -{discountPercent}%
              </Badge>
            )}
          </div>
        )}
        <span className="text-foreground text-3xl font-bold">
          {formatCurrency(tire.price)}
        </span>
        {tire.installments && (
          <span className="text-muted-foreground text-sm">
            ou {tire.installments.count}x de{" "}
            {formatCurrency(tire.installments.value)} sem juros
          </span>
        )}
      </div>

      {isOutOfStock ? (
        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm">
            Este produto está indisponível no momento. Confira os produtos
            relacionados abaixo.
          </p>
          <Button size="lg" disabled className="w-full sm:w-auto">
            Indisponível
          </Button>
        </div>
      ) : (
        <ProductBuyBox productId={tire.id} />
      )}

      <ShippingCalculator price={tire.price} />
    </div>
  );
}
