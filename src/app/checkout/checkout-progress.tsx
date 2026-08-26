import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = [
  "Identificação",
  "Endereço",
  "Entrega",
  "Pagamento",
  "Revisão",
];

export function CheckoutProgress({ currentStep }: { currentStep: number }) {
  return (
    <ol className="mb-6 flex items-center gap-1 overflow-x-auto sm:gap-2">
      {STEPS.map((label, index) => {
        const stepNumber = index + 1;
        const isDone = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <li key={label} className="flex shrink-0 items-center gap-1 sm:gap-2">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                isDone && "border-primary bg-primary text-primary-foreground",
                isCurrent && "border-primary text-primary",
                !isDone && !isCurrent && "border-border text-muted-foreground",
              )}
            >
              {isDone ? <Check className="h-3.5 w-3.5" /> : stepNumber}
            </span>
            <span
              className={cn(
                "hidden text-xs font-medium sm:inline",
                isCurrent ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {stepNumber < STEPS.length && (
              <span className="mx-1 h-px w-4 shrink-0 bg-border sm:w-8" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
