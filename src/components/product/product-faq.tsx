import type { FaqItem } from "@/types/catalog";

// Accordion nativo (details/summary), mesmo padrão do FAQ da home.
export function ProductFaq({ items }: { items: FaqItem[] }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-foreground text-xl font-bold">
        Perguntas frequentes
      </h2>
      <div className="divide-border border-border flex flex-col divide-y rounded-xl border">
        {items.map((item) => (
          <details key={item.id} className="group p-4">
            <summary className="text-foreground flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold marker:content-none">
              {item.question}
              <span
                aria-hidden
                className="text-muted-foreground shrink-0 text-lg transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="text-muted-foreground mt-3 text-sm">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
