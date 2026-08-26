"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock, Copy, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { PaymentStatus } from "@prisma/client";

const POLL_INTERVAL_MS = 4000;

export function PixPaymentStatus({
  orderId,
  qrCode,
  qrCodeUrl,
  amount,
  expiresAt,
  initialStatus,
}: {
  orderId: string;
  qrCode: string;
  qrCodeUrl: string;
  amount: number;
  expiresAt: string;
  initialStatus: PaymentStatus;
}) {
  const [status, setStatus] = useState<PaymentStatus>(initialStatus);
  const [copied, setCopied] = useState(false);
  const isFinal =
    status === "PAID" || status === "EXPIRED" || status === "CANCELLED" || status === "FAILED";
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isFinal) return;

    async function poll() {
      try {
        const response = await fetch(`/api/orders/${orderId}/status`, {
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = (await response.json()) as { paymentStatus: PaymentStatus | null };
        if (data.paymentStatus) setStatus(data.paymentStatus);
      } catch {
        // Erro temporário de rede: a próxima tentativa do polling resolve.
      }
    }

    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isFinal, orderId]);

  // Expira no navegador mesmo sem resposta do gateway, para não deixar o
  // cliente esperando um código que já venceu.
  useEffect(() => {
    if (isFinal) return;
    const msRemaining = new Date(expiresAt).getTime() - Date.now();
    // Math.max(..., 0): mesmo se já passou do prazo, o setState acontece de
    // forma assíncrona (via callback do setTimeout), nunca direto no corpo
    // do efeito.
    const timeout = setTimeout(() => setStatus("EXPIRED"), Math.max(msRemaining, 0));
    return () => clearTimeout(timeout);
  }, [expiresAt, isFinal]);

  async function handleCopy() {
    await navigator.clipboard.writeText(qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (status === "PAID") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-primary bg-secondary p-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-primary" aria-hidden />
        <p className="text-lg font-semibold text-foreground">Pagamento confirmado!</p>
      </div>
    );
  }

  if (status === "EXPIRED") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-destructive p-6 text-center">
        <XCircle className="h-10 w-10 text-destructive" aria-hidden />
        <p className="font-semibold text-foreground">
          Este PIX expirou. Gere um novo código para continuar.
        </p>
        <a href="/checkout">
          <Button className="mt-2">Voltar ao checkout</Button>
        </a>
      </div>
    );
  }

  if (status === "FAILED" || status === "CANCELLED") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-destructive p-6 text-center">
        <XCircle className="h-10 w-10 text-destructive" aria-hidden />
        <p className="font-semibold text-foreground">
          Não foi possível aprovar o pagamento. Verifique os dados ou tente
          outra forma de pagamento.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border p-6 text-center">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Clock className="h-4 w-4 animate-pulse" aria-hidden />
        Aguardando pagamento
      </div>

      {qrCodeUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- imagem vem do gateway, não faz sentido pré-otimizar.
        <img
          src={qrCodeUrl}
          alt="QR code para pagamento via Pix"
          className="h-48 w-48 rounded-lg border border-border bg-white p-2"
        />
      )}

      <p className="text-lg font-bold text-foreground">{formatCurrency(amount)}</p>

      <div className="flex w-full max-w-sm items-center gap-2">
        <input
          readOnly
          value={qrCode}
          className="w-full truncate rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground"
        />
        <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="h-4 w-4" />
          {copied ? "Copiado!" : "Copiar"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Abra o app do seu banco, escolha pagar com Pix e escaneie o QR code
        ou cole o código copiado. Assim que o pagamento for confirmado, esta
        página atualiza sozinha.
      </p>
    </div>
  );
}
