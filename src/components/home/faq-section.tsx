import { Container } from "@/components/ui/container";
import { faqItems } from "@/lib/mock-data";

// Accordion nativo (details/summary): sem JavaScript extra, bom para SEO.
export function FaqSection() {
  return (
    <section>
      <Container className="py-14 sm:py-20">
        <h2 className="text-foreground mb-8 text-2xl font-bold">
          Perguntas frequentes
        </h2>
        <div className="divide-border border-border mx-auto flex max-w-3xl flex-col divide-y rounded-xl border">
          {faqItems.map((item) => (
            <details key={item.id} className="group p-5">
              <summary className="text-foreground flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold marker:content-none">
                {item.question}
                <span
                  aria-hidden
                  className="text-muted-foreground shrink-0 text-lg transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="text-muted-foreground mt-3 text-sm">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
