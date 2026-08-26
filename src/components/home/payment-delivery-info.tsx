import { CreditCard, MapPin } from "lucide-react";

import { Container } from "@/components/ui/container";
import { deliveryInfo, paymentMethods } from "@/lib/mock-data";

export function PaymentDeliveryInfo() {
  return (
    <section className="bg-secondary">
      <Container className="grid grid-cols-1 gap-8 py-14 sm:py-20 md:grid-cols-2">
        <div className="border-border bg-background flex flex-col gap-4 rounded-xl border p-6">
          <div className="flex items-center gap-2">
            <CreditCard className="text-primary h-5 w-5" aria-hidden />
            <h2 className="text-foreground text-lg font-semibold">
              Formas de pagamento
            </h2>
          </div>
          <ul className="flex flex-wrap gap-2">
            {paymentMethods.map((method) => (
              <li
                key={method}
                className="border-border text-foreground rounded-full border px-3 py-1 text-sm"
              >
                {method}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-border bg-background flex flex-col gap-4 rounded-xl border p-6">
          <div className="flex items-center gap-2">
            <MapPin className="text-primary h-5 w-5" aria-hidden />
            <h2 className="text-foreground text-lg font-semibold">
              {deliveryInfo.title}
            </h2>
          </div>
          <p className="text-muted-foreground text-sm">
            {deliveryInfo.description}
          </p>
        </div>
      </Container>
    </section>
  );
}
