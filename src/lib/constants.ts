import type { ProductCategory } from "@/types/catalog";

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "PneuMinas",
  description: "Pneus com entrega rápida para todo o estado de Minas Gerais.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

// Contato de WhatsApp usado no cabeçalho e no botão flutuante.
export const WHATSAPP_PHONE = "38991481225";
export const WHATSAPP_PHONE_LABEL = "(38) 99148-1225";
export const WHATSAPP_LINK = `https://wa.me/55${WHATSAPP_PHONE}`;

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  carro: "Carro",
  "suv-caminhonete": "SUV e caminhonete",
  moto: "Moto",
  "van-e-utilitario": "Van e utilitário",
  "caminhao-e-onibus": "Caminhão e ônibus",
  "agricola-e-otr": "Agrícola e OTR",
  "kit-de-pneus": "Kit de Pneus",
};

export type NavLink = {
  label: string;
  href: string;
  /** true = a categoria ainda não tem produtos/infraestrutura própria (mostra "em breve" em vez de 404). */
  comingSoon?: boolean;
};

// Barra de categorias abaixo do header principal. "Promoções" vem primeiro e
// destacado; o restante são segmentos de veículo/uso.
export const categoryNavLinks: NavLink[] = [
  { label: "Promoções", href: "/ofertas" },
  { label: "Carros de Passeio", href: "/categoria/carro" },
  { label: "Marcas", href: "/marcas" },
  { label: "Kit de Pneus", href: "/categoria/kit-de-pneus" },
  { label: "Caminhonete e SUV", href: "/categoria/suv-caminhonete" },
  { label: "Van e Utilitário", href: "/categoria/van-e-utilitario" },
  { label: "Moto", href: "/categoria/moto" },
  { label: "Caminhão e Ônibus", href: "/categoria/caminhao-e-onibus" },
  { label: "Agrícola e OTR", href: "/categoria/agricola-e-otr" },
];

export const footerLinkGroups: { title: string; links: NavLink[] }[] = [
  {
    title: "Institucional",
    links: [
      { label: "Sobre a loja", href: "/institucional" },
      { label: "Política de privacidade", href: "/politica-de-privacidade" },
      { label: "Termos de uso", href: "/termos-de-uso" },
    ],
  },
  {
    title: "Ajuda",
    links: [
      { label: "Central de atendimento", href: "/atendimento" },
      { label: "Trocas e devoluções", href: "/trocas-e-devolucoes" },
      { label: "Rastrear pedido", href: "/rastreio" },
    ],
  },
  {
    title: "Categorias",
    links: [
      { label: "Pneus de carro", href: "/categoria/carro" },
      {
        label: "Pneus de SUV e caminhonete",
        href: "/categoria/suv-caminhonete",
      },
      { label: "Pneus de moto", href: "/categoria/moto" },
    ],
  },
];
