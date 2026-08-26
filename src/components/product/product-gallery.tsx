"use client";

import { useState } from "react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { ProductImagePlaceholder } from "./product-image-placeholder";

const ROTATIONS = [0, 6, -6, 3];

export function ProductGallery({
  productName,
  isOffer,
  images = [],
}: {
  productName: string;
  isOffer?: boolean;
  images?: string[];
}) {
  const [selected, setSelected] = useState(0);
  const hasImages = images.length > 0;
  const activeImage = images[selected] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="border-border bg-white text-muted-foreground relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border p-10">
        {isOffer && (
          <Badge
            variant="default"
            className="bg-accent text-accent-foreground absolute top-3 left-3 z-10"
          >
            Oferta
          </Badge>
        )}
        {hasImages && activeImage ? (
          <Image
            src={activeImage}
            alt={productName}
            fill
            sizes="(min-width: 1024px) 480px, 90vw"
            className="object-contain p-6"
            priority
          />
        ) : (
          <ProductImagePlaceholder
            className="h-full w-full"
            rotate={ROTATIONS[selected]}
          />
        )}
      </div>

      {hasImages && images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`Ver foto ${index + 1} de ${productName}`}
              aria-current={selected === index}
              className={cn(
                "bg-white relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border p-2 transition-colors",
                selected === index
                  ? "border-primary"
                  : "border-border hover:border-foreground/30",
              )}
            >
              <Image
                src={image}
                alt={`${productName} — foto ${index + 1}`}
                fill
                sizes="120px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
