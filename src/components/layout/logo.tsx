import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

// Logo em arquivo de imagem (public/logo.png) em vez de gerada em SVG/texto —
// troque esse arquivo pra atualizar a marca em todo o site (header, footer).
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center", className)}>
      <Image
        src="/logo.png"
        alt="PneuMinas"
        width={160}
        height={40}
        priority
        className="h-8 w-auto"
      />
    </Link>
  );
}
