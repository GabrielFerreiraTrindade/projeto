"use client";

import Link from "next/link";
import { useState } from "react";
import { User } from "lucide-react";

import { logoutAction } from "@/app/minha-conta/actions";
import type { PublicUser } from "@/types/account";

const links = [
  { href: "/minha-conta", label: "Minha conta" },
  { href: "/minha-conta/pedidos", label: "Meus pedidos" },
  { href: "/minha-conta/enderecos", label: "Meus endereços" },
];

export function AccountMenu({ user }: { user: PublicUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const firstName = user.name.split(" ")[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="text-white hover:bg-white/10 hidden h-11 items-center gap-2 rounded-md px-2 md:inline-flex"
        aria-expanded={isOpen}
      >
        <User className="h-6 w-6" />
        <span className="flex flex-col items-start text-left leading-tight">
          <span className="text-white/70 text-xs">Olá,</span>
          <span className="text-sm font-semibold">{firstName}</span>
        </span>
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Fechar menu da conta"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          />
          <div className="border-border bg-background absolute right-0 z-50 mt-2 w-56 rounded-xl border p-2 shadow-lg">
            <nav className="flex flex-col">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-foreground hover:bg-muted rounded-md px-3 py-2 text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <form
              action={logoutAction}
              className="border-border mt-1 border-t pt-1"
            >
              <button
                type="submit"
                className="text-destructive hover:bg-muted w-full rounded-md px-3 py-2 text-left text-sm font-medium"
              >
                Sair
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
