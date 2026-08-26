import { CATEGORY_LABELS } from "@/lib/constants";
import type { Tire } from "@/types/catalog";

export function ProductSpecs({ tire }: { tire: Tire }) {
  const rows: [string, string][] = [
    ["Marca", tire.brand],
    ["Modelo", tire.model],
    ["Medida", tire.size],
    ["Largura", `${tire.width} mm`],
    // Pneus comerciais (van/utilitário) não têm número de perfil.
    ...(tire.aspectRatio != null
      ? ([["Perfil (série)", `${tire.aspectRatio}`]] as [string, string][])
      : []),
    ["Aro", `${tire.rimDiameter}"`],
    ["Índice de carga", tire.loadIndex],
    ["Índice de velocidade", tire.speedRating],
    ["Run flat", tire.runFlat ? "Sim" : "Não"],
    ["Aplicação", CATEGORY_LABELS[tire.category]],
  ];

  return (
    <section id="especificacoes" className="flex flex-col gap-4">
      <h2 className="text-foreground text-xl font-bold">
        Especificações técnicas
      </h2>
      <dl className="divide-border border-border grid grid-cols-1 divide-y rounded-xl border sm:grid-cols-2 sm:divide-y-0">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="sm:border-border flex items-center justify-between gap-4 px-4 py-3 text-sm sm:border-b"
          >
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-foreground font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
