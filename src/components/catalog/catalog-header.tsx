import Link from "next/link";

export function CatalogHeader({
  sizeLabel,
  total,
}: {
  sizeLabel: string;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <nav aria-label="Breadcrumb" className="text-muted-foreground text-xs">
        <Link href="/" className="hover:text-foreground">
          Início
        </Link>
        <span className="mx-1.5">/</span>
        <span>Pneus {sizeLabel}</span>
      </nav>
      <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
        Pneus {sizeLabel}
      </h1>
      <p className="text-muted-foreground text-sm">
        {total} {total === 1 ? "produto encontrado" : "produtos encontrados"}
      </p>
    </div>
  );
}
