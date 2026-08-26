export function ProductDescription({ description }: { description: string }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-foreground text-xl font-bold">Descrição</h2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </section>
  );
}
