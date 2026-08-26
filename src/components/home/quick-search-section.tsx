import { Container } from "@/components/ui/container";
import { getAvailableSizeCombinations } from "@/lib/services/tire-size-options-service";

import { QuickSearch } from "./quick-search";

export async function QuickSearchSection() {
  const sizeCombinations = await getAvailableSizeCombinations();

  return (
    <section className="bg-primary relative overflow-hidden">
      {/* Textura pontilhada sutil no lado escuro, decoração original (não copiada de nenhum site). */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "14px 14px",
          color: "var(--accent)",
        }}
        aria-hidden
      />

      {/* Bloco verde diagonal à esquerda. */}
      <div
        className="bg-accent absolute inset-y-0 left-0 w-full sm:w-[46%]"
        style={{ clipPath: "polygon(0 0, 100% 0, 82% 100%, 0 100%)" }}
        aria-hidden
      >
        {/* Marca d'água decorativa (ícone de pneu próprio, ver Logo). */}
        <svg
          viewBox="0 0 40 40"
          className="absolute -top-6 -right-10 h-56 w-56 text-black/10 sm:h-72 sm:w-72"
          aria-hidden
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
      </div>

      <Container className="relative flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="text-accent-foreground shrink-0">
          <h2 className="text-2xl font-extrabold tracking-tight uppercase sm:text-3xl">
            Busque <span className="text-yellow-300">por medida</span>
          </h2>
          <p className="text-sm opacity-90">
            Verifique a medida na lateral do seu pneu.
          </p>
        </div>

        <div className="w-full sm:max-w-2xl">
          <QuickSearch sizeCombinations={sizeCombinations} />
        </div>
      </Container>
    </section>
  );
}
