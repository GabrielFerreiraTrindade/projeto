import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

// Campo de busca estrutural. A lógica de busca por medida, veículo ou marca
// será implementada em uma etapa futura.
export function SearchBar({ className }: { className?: string }) {
  return (
    <form
      role="search"
      className={cn(
        "border-border bg-background focus-within:ring-primary flex w-full items-stretch overflow-hidden rounded-full border focus-within:ring-2",
        className,
      )}
      onSubmit={(event) => event.preventDefault()}
    >
      <input
        type="search"
        name="q"
        placeholder="O que você procura? Ex.: Pneu 205 55 16"
        aria-label="Buscar produtos"
        className="text-foreground placeholder:text-muted-foreground h-11 w-full min-w-0 flex-1 bg-transparent pl-4 text-sm outline-none"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="bg-accent text-accent-foreground flex w-12 shrink-0 items-center justify-center"
      >
        <Search className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}
