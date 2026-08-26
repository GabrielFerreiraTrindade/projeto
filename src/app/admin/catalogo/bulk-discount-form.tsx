"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { applyBulkDiscountAction, clearAllDiscountsAction } from "./actions";

export function BulkDiscountForm() {
  const router = useRouter();
  const [percent, setPercent] = useState("10");
  const [isApplying, setIsApplying] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleApply() {
    const parsed = Number(percent.replace(",", "."));
    setIsApplying(true);
    setMessage(null);
    try {
      const result = await applyBulkDiscountAction(parsed);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else if (result.success) {
        setMessage({ type: "success", text: result.success });
        router.refresh();
      }
    } finally {
      setIsApplying(false);
    }
  }

  async function handleClear() {
    setIsClearing(true);
    setMessage(null);
    try {
      const result = await clearAllDiscountsAction();
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else if (result.success) {
        setMessage({ type: "success", text: result.success });
        router.refresh();
      }
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-secondary p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground">Desconto para todos os produtos ativos</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={percent}
              onChange={(event) => setPercent(event.target.value)}
              className="h-9 w-20 rounded-md border border-border bg-background px-2 text-sm"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </label>
        <button
          type="button"
          onClick={handleApply}
          disabled={isApplying}
          className="h-9 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground disabled:opacity-50"
        >
          {isApplying ? "Aplicando..." : "Aplicar desconto a todos"}
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={isClearing}
          className="h-9 rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-background disabled:opacity-50"
        >
          {isClearing ? "Removendo..." : "Remover todos os descontos"}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Aplicar recalcula sempre a partir do preço original (não acumula desconto em cima de
        desconto já aplicado). Preços editados manualmente também podem ser ajustados um a um em
        cada produto abaixo.
      </p>
      {message && (
        <p
          className={
            message.type === "success"
              ? "rounded-lg bg-green-50 px-3 py-2 text-xs text-green-800"
              : "rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700"
          }
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
