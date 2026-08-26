import Link from "next/link";

import { logoutAction } from "@/app/minha-conta/actions";

const links = [
  { href: "/minha-conta", label: "Visão geral" },
  { href: "/minha-conta/pedidos", label: "Meus pedidos" },
  { href: "/minha-conta/enderecos", label: "Meus endereços" },
];

export function AccountNav({ userName }: { userName: string }) {
  return (
    <aside className="border-border flex flex-col gap-4 rounded-xl border p-4">
      <div>
        <p className="text-muted-foreground text-xs">Olá,</p>
        <p className="text-foreground font-semibold">{userName}</p>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-foreground hover:bg-muted rounded-md px-3 py-2 text-sm font-medium"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <form action={logoutAction}>
        <button
          type="submit"
          className="text-destructive hover:bg-muted w-full rounded-md px-3 py-2 text-left text-sm font-medium"
        >
          Sair
        </button>
      </form>
    </aside>
  );
}
