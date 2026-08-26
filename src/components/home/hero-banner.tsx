"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

type Slide = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

// Conteúdo dos slides: só afirmações verdadeiras sobre a loja (nenhum
// desconto ou promoção específica é inventado aqui — ofertas reais aparecem
// na seção "Produtos em promoção", vindas do banco).
const SLIDES: Slide[] = [
  {
    eyebrow: "Frete grátis",
    title: "Frete grátis a partir de R$ 400 no Sudeste",
    description:
      "Minas Gerais, São Paulo, Rio de Janeiro e Espírito Santo. Para o resto do Brasil, frete grátis a partir de R$ 1.500.",
    ctaLabel: "Ver ofertas",
    ctaHref: "/ofertas",
  },
  {
    eyebrow: "10 marcas prioritárias",
    title: "Pirelli, Michelin, Goodyear, Bridgestone e mais",
    description: "Pneus originais das principais marcas do mercado, com estoque próprio.",
    ctaLabel: "Ver marcas",
    ctaHref: "/marcas",
  },
  {
    eyebrow: "Compra garantida",
    title: "Pagamento seguro no Pix ou cartão de crédito",
    description: "Ambiente protegido do início ao fim da compra, com garantia de fábrica.",
    ctaLabel: "Buscar meu pneu",
    ctaHref: "#busca-por-medida",
  },
];

const AUTO_ADVANCE_MS = 6000;

export function HeroBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[index];

  function goTo(next: number) {
    setIndex((next + SLIDES.length) % SLIDES.length);
  }

  return (
    <section className="bg-primary text-primary-foreground relative overflow-hidden">
      <Image
        src="/hero/tire-background.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Escurece a foto para o texto continuar legível em qualquer trecho da imagem. */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30"
        aria-hidden
      />

      <Container className="relative flex min-h-[280px] flex-col items-start justify-center gap-4 py-14 sm:min-h-[340px] sm:py-20">
        <span className="bg-accent text-accent-foreground rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase">
          {slide.eyebrow}
        </span>
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
          {slide.title}
        </h1>
        <p className="max-w-xl text-base text-white/80 sm:text-lg">
          {slide.description}
        </p>
        <Link
          href={slide.ctaHref}
          className="bg-accent text-accent-foreground mt-2 rounded-md px-6 py-3 text-sm font-bold hover:opacity-90"
        >
          {slide.ctaLabel}
        </Link>
      </Container>

      <button
        type="button"
        aria-label="Slide anterior"
        onClick={() => goTo(index - 1)}
        className="absolute top-1/2 left-2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 sm:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Próximo slide"
        onClick={() => goTo(index + 1)}
        className="absolute top-1/2 right-2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 sm:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((item, slideIndex) => (
          <button
            key={item.title}
            type="button"
            aria-label={`Ir para o slide ${slideIndex + 1}`}
            aria-current={slideIndex === index}
            onClick={() => goTo(slideIndex)}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              slideIndex === index ? "bg-accent w-6" : "bg-white/40",
            )}
          />
        ))}
      </div>
    </section>
  );
}
