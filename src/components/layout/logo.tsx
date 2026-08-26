import Link from "next/link";

import { cn } from "@/lib/utils";

// Ícone original (roda de pneu simplificada) + wordmark em duas cores —
// composição própria da PneuMinas, não baseada em nenhuma marca de terceiros.
function TireMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      role="img"
      aria-label="Ícone PneuMinas"
    >
      <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="20" cy="20" r="7" fill="currentColor" />
      {Array.from({ length: 8 }).map((_, index) => {
        const angle = (index * Math.PI) / 4;
        const x1 = 20 + Math.cos(angle) * 11;
        const y1 = 20 + Math.sin(angle) * 11;
        const x2 = 20 + Math.cos(angle) * 15;
        const y2 = 20 + Math.sin(angle) * 15;
        return (
          <line
            key={index}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "text-foreground inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight",
        className,
      )}
    >
      <TireMark className="text-accent h-8 w-8 shrink-0" />
      <span>
        pneu
        <span className="text-accent">minas</span>
      </span>
    </Link>
  );
}
