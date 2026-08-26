"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, ShieldCheck, Truck, User, X } from "lucide-react";

import { logoutAction } from "@/app/minha-conta/actions";
import { Container } from "@/components/ui/container";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { categoryNavLinks, WHATSAPP_LINK, WHATSAPP_PHONE_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PublicUser } from "@/types/account";

import { AccountMenu } from "./account-menu";
import { Logo } from "./logo";
import { MiniCart } from "./mini-cart";
import { SearchBar } from "./search-bar";

// Primeiro link ("Promoções") é destacado como botão, o restante fica em
// texto simples — mesma composição visual em todas as larguras de tela.
const [highlightedNavLink, ...restNavLinks] = categoryNavLinks;

export function Header({ user }: { user: PublicUser | null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-border bg-background sticky top-0 z-50 border-b">
      {/* Barra utilitária */}
      <div className="bg-[#2b2d33] text-primary-foreground hidden md:block">
        <Container className="flex h-10 items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Entrega para todo o Brasil
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Entrega garantida
            </span>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:underline"
            >
              <WhatsAppIcon className="h-3.5 w-3.5 shrink-0 text-[#25D366]" />
              Precisa de ajuda? {WHATSAPP_PHONE_LABEL}
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={user ? "/minha-conta/pedidos" : "/login?redirect=/minha-conta/pedidos"}
              className="bg-accent text-accent-foreground rounded-full px-3 py-1.5 font-semibold hover:opacity-90"
            >
              Meus Pedidos
            </Link>
            <Link
              href={user ? "/minha-conta" : "/login"}
              className="bg-accent text-accent-foreground rounded-full px-3 py-1.5 font-semibold hover:opacity-90"
            >
              Minha Conta
            </Link>
          </div>
        </Container>
      </div>

      {/* Linha principal */}
      <div className="bg-black">
        <Container className="flex h-16 items-center gap-4 md:gap-6">
          <button
            type="button"
            className="text-white inline-flex h-10 w-10 items-center justify-center rounded-md md:hidden"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          <Logo className="shrink-0 text-white" />

          <div className="hidden flex-1 md:block">
            <SearchBar />
          </div>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            {user ? (
              <AccountMenu user={user} />
            ) : (
              <Link
                href="/login"
                className="text-white hover:bg-white/10 hidden h-11 items-center gap-2 rounded-md px-2 md:inline-flex"
              >
                <User className="h-6 w-6" />
                <span className="flex flex-col items-start text-left leading-tight">
                  <span className="text-white/70 text-xs">Entre ou</span>
                  <span className="text-sm font-semibold">Cadastre-se</span>
                </span>
              </Link>
            )}
            <MiniCart />
          </div>
        </Container>
      </div>

      {/* Busca (mobile) */}
      <div className="border-border border-t px-4 py-3 md:hidden">
        <SearchBar />
      </div>

      {/* Navegação por categorias (desktop) */}
      <nav className="bg-[#2b2d33] hidden md:block">
        <Container>
          <ul className="flex h-11 items-center gap-6 overflow-x-auto text-sm font-medium whitespace-nowrap">
            <li>
              <Link
                href={highlightedNavLink.href}
                className="bg-accent text-accent-foreground rounded-full px-4 py-1.5 font-semibold hover:opacity-90"
              >
                {highlightedNavLink.label}
              </Link>
            </li>
            {restNavLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </nav>

      {/* Menu mobile */}
      <nav
        className={cn(
          "border-border border-t md:hidden",
          isMenuOpen ? "block" : "hidden",
        )}
      >
        <ul className="divide-border flex flex-col divide-y">
          {categoryNavLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-foreground block px-4 py-3 text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          {user ? (
            <>
              <li>
                <Link
                  href="/minha-conta"
                  className="text-foreground block px-4 py-3 text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Minha conta
                </Link>
              </li>
              <li>
                <Link
                  href="/minha-conta/pedidos"
                  className="text-foreground block px-4 py-3 text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Meus pedidos
                </Link>
              </li>
              <li>
                <Link
                  href="/minha-conta/enderecos"
                  className="text-foreground block px-4 py-3 text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Meus endereços
                </Link>
              </li>
              <li>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="text-destructive block w-full px-4 py-3 text-left text-sm font-medium"
                  >
                    Sair
                  </button>
                </form>
              </li>
            </>
          ) : (
            <li>
              <Link
                href="/login"
                className="text-foreground flex items-center gap-2 px-4 py-3 text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                Entrar / Cadastrar
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
