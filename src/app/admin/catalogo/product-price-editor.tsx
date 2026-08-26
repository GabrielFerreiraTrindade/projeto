"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { formatCurrency } from "@/lib/utils";
import { updateProductPriceAction } from "./actions";

export function ProductPriceEditor({
  productId,
  price,
  compareAtPrice,
}: {
  productId: string;
  price: number;
  compareAtPrice: number | null;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [priceInput, setPriceInput] = useState(String(price));
  const [compareInput, setCompareInput] = useState(compareAtPrice != null ? String(compareAtPrice) : "");
  const [error, setError] = useState<string | null>(null);

  function startEditing() {
    setPriceInput(String(price));
    setCompareInput(compareAtPrice != null ? String(compareAtPrice) : "");
    setError(null);
    setIsEditing(true);
  }

  async function handleSave() {
    const parsedPrice = Number(priceInput.replace(",", "."));
    const parsedCompare = compareInput.trim() === "" ? null : Number(compareInput.replace(",", "."));

    setIsSaving(true);
    setError(null);
    try {
      const result = await updateProductPriceAction(productId, parsedPrice, parsedCompare);
      if (result.error) {
        setError(result.error);
        return;
      }
      setIsEditing(false);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={startEditing}
        className="flex flex-col items-start text-left hover:underline"
        title="Editar preço"
      >
        {compareAtPrice != null ? (
          <span className="flex items-center gap-1.5">
            <span className="text-muted-foreground text-xs line-through">
              {formatCurrency(compareAtPrice)}
            </span>
            <span className="font-medium text-foreground">{formatCurrency(price)}</span>
          </span>
        ) : (
          <span>{formatCurrency(price)}</span>
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-md bg-background p-2 ring-1 ring-border">
      <label className="flex items-center gap-1.5 text-xs">
        <span className="w-16 text-muted-foreground">Preço</span>
        <input
          type="text"
          inputMode="decimal"
          value={priceInput}
          onChange={(event) => setPriceInput(event.target.value)}
          className="w-24 rounded border border-border bg-background px-1.5 py-1 text-xs"
        />
      </label>
      <label className="flex items-center gap-1.5 text-xs">
        <span className="w-16 text-muted-foreground">De (corte)</span>
        <input
          type="text"
          inputMode="decimal"
          placeholder="opcional"
          value={compareInput}
          onChange={(event) => setCompareInput(event.target.value)}
          className="w-24 rounded border border-border bg-background px-1.5 py-1 text-xs"
        />
      </label>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded bg-accent px-2 py-1 text-xs font-medium text-accent-foreground disabled:opacity-50"
        >
          {isSaving ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          disabled={isSaving}
          className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-secondary"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
