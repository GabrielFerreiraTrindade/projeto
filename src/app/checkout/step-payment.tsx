"use client";

import { useState } from "react";
import { AlertCircle, CreditCard, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import {
  CardTokenizationError,
  tokenizeCard,
} from "@/lib/payment/client/tokenize-card";
import { formatCurrency } from "@/lib/utils";

export type PaymentSelection =
  | { method: "PIX" }
  | {
      method: "CREDIT_CARD";
      cardToken: string;
      installments: number;
      brandHint: string;
      lastFourDigits: string;
    };

const MAX_INSTALLMENTS = Number(process.env.NEXT_PUBLIC_MAX_INSTALLMENTS ?? 12);

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function StepPayment({
  totalAmount,
  onBack,
  onNext,
}: {
  totalAmount: number;
  onBack: () => void;
  onNext: (selection: PaymentSelection) => void;
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [installments, setInstallments] = useState(1);
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCardSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsTokenizing(true);
    try {
      const result = await tokenizeCard({
        number: cardNumber,
        holderName,
        expMonth: Number(expMonth),
        expYear: Number(expYear),
        cvv,
      });
      onNext({
        method: "CREDIT_CARD",
        cardToken: result.token,
        installments,
        brandHint: cardNumber.replace(/\D/g, "").slice(0, 1) === "4" ? "Visa" : "Cartão",
        lastFourDigits: cardNumber.replace(/\D/g, "").slice(-4),
      });
    } catch (tokenError) {
      setError(
        tokenError instanceof CardTokenizationError
          ? tokenError.message
          : "Não conseguimos processar o pagamento agora. Tente novamente.",
      );
    } finally {
      setIsTokenizing(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">
        Como você quer pagar?
      </h2>

      <Tabs
        defaultValue="pix"
        items={[
          {
            value: "pix",
            label: "Pix",
            content: (
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3 rounded-xl border border-border p-4">
                  <QrCode className="h-6 w-6 shrink-0 text-primary" aria-hidden />
                  <p className="text-sm text-muted-foreground">
                    Você vai receber um QR code e o código Pix copia e cola
                    aqui mesmo, sem sair do site. O pagamento é confirmado
                    automaticamente.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onBack}>
                    Voltar
                  </Button>
                  <Button type="button" onClick={() => onNext({ method: "PIX" })}>
                    Continuar com Pix
                  </Button>
                </div>
              </div>
            ),
          },
          {
            value: "card",
            label: "Cartão de crédito",
            content: (
              <form onSubmit={handleCardSubmit} className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CreditCard className="h-4 w-4" aria-hidden />
                  Seus dados de cartão são enviados direto e com segurança ao
                  processador de pagamento — nunca ficam guardados em nosso
                  servidor.
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="card-number" className="text-sm font-medium text-foreground">
                    Número do cartão
                  </label>
                  <Input
                    id="card-number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="card-holder" className="text-sm font-medium text-foreground">
                    Nome impresso no cartão
                  </label>
                  <Input
                    id="card-holder"
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="card-exp-month" className="text-sm font-medium text-foreground">
                      Mês
                    </label>
                    <Input
                      id="card-exp-month"
                      value={expMonth}
                      onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                      placeholder="MM"
                      inputMode="numeric"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="card-exp-year" className="text-sm font-medium text-foreground">
                      Ano
                    </label>
                    <Input
                      id="card-exp-year"
                      value={expYear}
                      onChange={(e) => setExpYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="AAAA"
                      inputMode="numeric"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="card-cvv" className="text-sm font-medium text-foreground">
                      CVV
                    </label>
                    <Input
                      id="card-cvv"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      inputMode="numeric"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="card-installments" className="text-sm font-medium text-foreground">
                    Parcelas
                  </label>
                  <Select
                    id="card-installments"
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                  >
                    {Array.from({ length: MAX_INSTALLMENTS }, (_, index) => index + 1).map(
                      (count) => (
                        <option key={count} value={count}>
                          {count}x de {formatCurrency(totalAmount / count)}
                          {count === 1 ? " à vista" : ""}
                        </option>
                      ),
                    )}
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    O valor de cada parcela é uma estimativa — o valor final
                    (com ou sem juros) é confirmado pela operadora do cartão
                    de acordo com a configuração da nossa conta.
                  </p>
                </div>

                {error && (
                  <p className="flex items-center gap-1.5 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                    {error}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onBack}>
                    Voltar
                  </Button>
                  <Button type="submit" disabled={isTokenizing}>
                    {isTokenizing ? "Validando cartão..." : "Continuar"}
                  </Button>
                </div>
              </form>
            ),
          },
        ]}
      />
    </div>
  );
}
