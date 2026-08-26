import Link from "next/link";
import { Lock, MessageSquareText, ShieldCheck, Star } from "lucide-react";

import { Container } from "@/components/ui/container";
import { footerLinkGroups, siteConfig } from "@/lib/constants";

import { Logo } from "./logo";

// Selos de confiança. "Compra Segura" e "Loja Protegida" são descrições
// genéricas das próprias práticas da loja (SSL, dados protegidos — ver
// /politica-de-privacidade), não certificações de terceiros. "Google
// Reviews" e "Reclame Aqui" apontam pra busca do nome da loja nessas
// plataformas — troque o href por um link direto para o perfil real da loja
// assim que ele existir.
const trustBadges = [
  { label: "Compra Segura", icon: ShieldCheck, href: "/politica-de-privacidade" },
  { label: "Loja Protegida", icon: Lock, href: "/politica-de-privacidade" },
  {
    label: "Google Reviews",
    icon: Star,
    href: `https://www.google.com/search?q=${encodeURIComponent(siteConfig.name)}+avaliações`,
  },
  {
    label: "Reclame Aqui",
    icon: MessageSquareText,
    href: `https://www.reclameaqui.com.br/busca/?q=${encodeURIComponent(siteConfig.name)}`,
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border bg-secondary border-t">
      <Container className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="col-span-2 flex flex-col gap-3 lg:col-span-2">
          <Logo />
          <p className="text-muted-foreground max-w-xs text-sm">
            {siteConfig.description}
          </p>
        </div>

        {footerLinkGroups.map((group) => (
          <div key={group.title} className="flex flex-col gap-3">
            <h3 className="text-foreground text-sm font-semibold">
              {group.title}
            </h3>
            <ul className="flex flex-col gap-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-border border-t">
        <Container className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 py-6 sm:justify-start">
          {trustBadges.map((badge) => (
            <a
              key={badge.label}
              href={badge.href}
              target={badge.href.startsWith("http") ? "_blank" : undefined}
              rel={badge.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs font-medium"
            >
              <badge.icon className="h-4 w-4 shrink-0" aria-hidden />
              {badge.label}
            </a>
          ))}
        </Container>
      </div>

      <div className="border-border border-t">
        <Container className="text-muted-foreground flex flex-col items-center justify-between gap-2 py-6 text-xs sm:flex-row">
          <p>
            &copy; {year} {siteConfig.name}. Todos os direitos reservados.
          </p>
          <p>Protótipo em desenvolvimento — Minas Gerais, Brasil.</p>
        </Container>
      </div>
    </footer>
  );
}
