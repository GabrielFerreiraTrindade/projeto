import Link from "next/link";

import { formatSizeLabel } from "@/lib/catalog/size-slug";
import type { TireSize } from "@/types/catalog";

export function VehicleResultHeader({
  label,
  sizes,
}: {
  label: string;
  sizes: TireSize[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <nav aria-label="Breadcrumb" className="text-muted-foreground text-xs">
        <Link href="/" className="hover:text-foreground">
          Início
        </Link>
        <span className="mx-1.5">/</span>
        <span>{label}</span>
      </nav>
      <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
        Pneus para {label}
      </h1>
      <p className="text-muted-foreground text-sm">
        Medida{sizes.length > 1 ? "s" : ""} compatível
        {sizes.length > 1 ? "eis" : ""}:{" "}
        <span className="text-foreground font-semibold">
          {sizes.map((size) => formatSizeLabel(size)).join(" · ")}
        </span>
      </p>
    </div>
  );
}
