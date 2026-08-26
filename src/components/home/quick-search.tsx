"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { formatSizeSlug } from "@/lib/catalog/size-slug";
import {
  tireAspectRatios,
  tireRimDiameters,
  tireWidths,
} from "@/lib/mock-data";
import type { SizeCombination } from "@/lib/services/tire-size-options-service";

function RoundSelect({
  name,
  label,
  options,
  value,
  disabled,
  onChange,
}: {
  name: string;
  label: string;
  options: string[];
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative flex-1">
      <select
        name={name}
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        required
        style={{ color: "#111827" }}
        className="h-12 w-full appearance-none rounded-full bg-white py-0 pr-11 pl-4 text-sm font-semibold shadow-sm outline-none disabled:opacity-60"
      >
        <option value="" disabled style={{ color: "#111827" }}>
          {label}
        </option>
        {options.map((option) => (
          <option key={option} value={option} style={{ color: "#111827" }}>
            {option}
          </option>
        ))}
      </select>
      <span className="bg-accent pointer-events-none absolute top-1/2 right-1.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full">
        <ChevronDown className="h-4 w-4 text-white" aria-hidden />
      </span>
    </div>
  );
}

// Busca por medida: navega para /pneus/[medida]. "Inteligente" — depois que
// a largura é escolhida, o perfil só mostra opções que existem de fato no
// catálogo para aquela largura (e o aro só as que existem para
// largura+perfil). Antes de escolher a largura, os três campos mostram a
// lista completa de medidas padrão do mercado, para a busca continuar
// aceitando qualquer combinação real.
export function QuickSearch({
  sizeCombinations,
}: {
  sizeCombinations: SizeCombination[];
}) {
  const router = useRouter();
  const [width, setWidth] = useState("");
  const [aspectRatio, setAspectRatio] = useState("");
  const [rimDiameter, setRimDiameter] = useState("");

  const availableAspectRatios = useMemo(() => {
    if (!width) return tireAspectRatios;
    const matches = sizeCombinations.filter((combo) => combo.width === Number(width));
    if (matches.length === 0) return tireAspectRatios;
    return [...new Set(matches.map((combo) => String(combo.aspectRatio)))].sort(
      (a, b) => Number(a) - Number(b),
    );
  }, [width, sizeCombinations]);

  const availableRimDiameters = useMemo(() => {
    if (!width || !aspectRatio) return tireRimDiameters;
    const matches = sizeCombinations.filter(
      (combo) => combo.width === Number(width) && combo.aspectRatio === Number(aspectRatio),
    );
    if (matches.length === 0) return tireRimDiameters;
    return [...new Set(matches.map((combo) => String(combo.rimDiameter)))].sort(
      (a, b) => Number(a) - Number(b),
    );
  }, [width, aspectRatio, sizeCombinations]);

  function handleWidthChange(next: string) {
    setWidth(next);
    setAspectRatio("");
    setRimDiameter("");
  }

  function handleAspectRatioChange(next: string) {
    setAspectRatio(next);
    setRimDiameter("");
  }

  function handleMeasureSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!width || !aspectRatio || !rimDiameter) return;

    router.push(
      `/pneus/${formatSizeSlug({
        width: Number(width),
        aspectRatio: Number(aspectRatio),
        rimDiameter: Number(rimDiameter),
      })}`,
    );
  }

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
      onSubmit={handleMeasureSubmit}
    >
      <div className="grid flex-1 grid-cols-3 gap-3">
        <RoundSelect
          name="largura"
          label="Largura"
          options={tireWidths}
          value={width}
          onChange={handleWidthChange}
        />
        <RoundSelect
          name="perfil"
          label="Perfil"
          options={availableAspectRatios}
          value={aspectRatio}
          onChange={handleAspectRatioChange}
        />
        <RoundSelect
          name="aro"
          label="Aro"
          options={availableRimDiameters}
          value={rimDiameter}
          onChange={setRimDiameter}
        />
      </div>
      <button
        type="submit"
        className="bg-accent text-accent-foreground h-12 shrink-0 rounded-full px-9 text-sm font-extrabold tracking-wide uppercase shadow-sm transition-transform hover:scale-[1.02] hover:opacity-90"
      >
        Buscar
      </button>
    </form>
  );
}
