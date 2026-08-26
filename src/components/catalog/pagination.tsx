import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { setPageHref } from "@/lib/catalog/query";
import { cn } from "@/lib/utils";

export function Pagination({
  basePath,
  searchParams,
  page,
  totalPages,
}: {
  basePath: string;
  searchParams: URLSearchParams;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      aria-label="Paginação"
      className="flex items-center justify-center gap-1"
    >
      <Link
        href={setPageHref(basePath, searchParams, page - 1)}
        aria-label="Página anterior"
        aria-disabled={page <= 1}
        className={cn(
          "border-border text-foreground hover:bg-muted inline-flex h-9 w-9 items-center justify-center rounded-md border",
          page <= 1 && "pointer-events-none opacity-40",
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {pages.map((pageNumber) => (
        <Link
          key={pageNumber}
          href={setPageHref(basePath, searchParams, pageNumber)}
          aria-current={pageNumber === page ? "page" : undefined}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium",
            pageNumber === page
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-foreground hover:bg-muted",
          )}
        >
          {pageNumber}
        </Link>
      ))}

      <Link
        href={setPageHref(basePath, searchParams, page + 1)}
        aria-label="Próxima página"
        aria-disabled={page >= totalPages}
        className={cn(
          "border-border text-foreground hover:bg-muted inline-flex h-9 w-9 items-center justify-center rounded-md border",
          page >= totalPages && "pointer-events-none opacity-40",
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
