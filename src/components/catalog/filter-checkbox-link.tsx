import Link from "next/link";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

// Filtro representado como link (alterna um parâmetro na URL). Não depende
// de JavaScript no cliente: cada clique recarrega a página com o filtro
// aplicado/removido, preservando os demais parâmetros.
export function FilterCheckboxLink({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count?: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-pressed={active}
      className="text-foreground hover:bg-muted flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm"
    >
      <span className="flex items-center gap-2">
        <span
          aria-hidden
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
            active ? "border-primary bg-primary" : "border-border",
          )}
        >
          {active && (
            <Check
              className="text-primary-foreground h-3 w-3"
              strokeWidth={3}
            />
          )}
        </span>
        {label}
      </span>
      {typeof count === "number" && (
        <span className="text-muted-foreground text-xs">{count}</span>
      )}
    </Link>
  );
}
