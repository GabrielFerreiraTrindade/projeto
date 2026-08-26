import { BadgeCheck, Headset, Lock, ShieldCheck, Truck } from "lucide-react";

import { Container } from "@/components/ui/container";
import { storeBenefits } from "@/lib/mock-data";

const icons = [ShieldCheck, Lock, Truck, BadgeCheck, Headset];

export function BenefitsBar() {
  return (
    <section className="border-border border-y">
      <Container className="grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-5">
        {storeBenefits.map((benefit, index) => {
          const Icon = icons[index % icons.length];
          return (
            <div key={benefit.title} className="flex items-start gap-3">
              <Icon className="text-primary h-6 w-6 shrink-0" aria-hidden />
              <div>
                <h3 className="text-foreground text-sm font-semibold">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {benefit.description}
                </p>
              </div>
            </div>
          );
        })}
      </Container>
    </section>
  );
}
