export function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-border border-b py-4 first:pt-0 last:border-b-0">
      <h3 className="text-foreground mb-2 text-sm font-semibold">{title}</h3>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}
