import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function Rating({
  value,
  reviewCount,
  className,
}: {
  value: number;
  reviewCount?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center" aria-hidden>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              "h-3.5 w-3.5",
              index < Math.round(value)
                ? "fill-accent text-accent"
                : "text-border fill-none",
            )}
          />
        ))}
      </div>
      <span className="sr-only">{value.toFixed(1)} de 5 estrelas</span>
      {typeof reviewCount === "number" && (
        <span className="text-muted-foreground text-xs">({reviewCount})</span>
      )}
    </div>
  );
}
