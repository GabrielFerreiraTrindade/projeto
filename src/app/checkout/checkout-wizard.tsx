"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/lib/cart/cart-context";
import { estimateShippingOptions, type ShippingOption } from "@/lib/services/shipping-service";
import type { Address } from "@/types/account";

import { submitCheckoutAction } from "./actions";
import { CheckoutProgress } from "./checkout-progress";
import { CheckoutSummary } from "./checkout-summary";
import { StepAddress } from "./step-address";
import { StepIdentification, type IdentificationData } from "./step-identification";
import { StepPayment, type PaymentSelection } from "./step-payment";
import { StepReview } from "./step-review";
import { StepShipping } from "./step-shipping";

export function CheckoutWizard({
  user,
  addresses,
}: {
  user: { name: string; email: string; cpf: string; phone: string };
  addresses: Address[];
}) {
  const router = useRouter();
  const { lines, summary } = useCart();

  const [step, setStep] = useState(1);
  const [identification, setIdentification] = useState<IdentificationData>({
    name: user.name,
    document: user.cpf,
    email: user.email,
    phone: user.phone,
  });
  const [addressId, setAddressId] = useState<string | null>(null);
  const [shipping, setShipping] = useState<ShippingOption | null>(null);
  const [payment, setPayment] = useState<PaymentSelection | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedAddress = addresses.find((address) => address.id === addressId) ?? null;

  const shippingOptions = selectedAddress
    ? estimateShippingOptions(selectedAddress.zipCode, summary.subtotal - summary.discount)
    : [];

  async function handleFinalSubmit() {
    if (!selectedAddress || !shipping || !payment) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const result = await submitCheckoutAction({
      addressId: selectedAddress.id,
      lines: lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
      })),
      customer: {
        name: identification.name,
        document: identification.document,
        email: identification.email,
        phoneAreaCode: identification.phone.replace(/\D/g, "").slice(0, 2),
        phoneNumber: identification.phone.replace(/\D/g, "").slice(2),
      },
      shipping: {
        method: shipping.method,
        carrier: shipping.carrier,
        price: shipping.price,
      },
      payment:
        payment.method === "PIX"
          ? { method: "PIX" }
          : {
              method: "CREDIT_CARD",
              cardToken: payment.cardToken,
              installments: payment.installments,
            },
    });

    // Se chegou aqui, não houve redirect (deu erro) — sucesso já navegou.
    if (result?.error) {
      setSubmitError(result.error);
      setIsSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
        <p className="font-semibold text-foreground">Seu carrinho está vazio</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-sm font-medium text-primary hover:underline"
        >
          Continuar comprando
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      <div className="order-2 lg:order-1">
        <CheckoutProgress currentStep={step} />

        <div className="rounded-xl border border-border p-5 sm:p-6">
          {step === 1 && (
            <StepIdentification
              initial={identification}
              onNext={(data) => {
                setIdentification(data);
                setStep(2);
              }}
            />
          )}

          {step === 2 && (
            <StepAddress
              addresses={addresses}
              selectedId={addressId}
              onBack={() => setStep(1)}
              onNext={(id) => {
                setAddressId(id);
                setShipping(null);
                setStep(3);
              }}
            />
          )}

          {step === 3 && selectedAddress && (
            <StepShipping
              options={shippingOptions}
              selected={shipping}
              onBack={() => setStep(2)}
              onNext={(option) => {
                setShipping(option);
                setStep(4);
              }}
            />
          )}

          {step === 4 && shipping && (
            <StepPayment
              totalAmount={summary.subtotal - summary.discount + shipping.price}
              onBack={() => setStep(3)}
              onNext={(selection) => {
                setPayment(selection);
                setStep(5);
              }}
            />
          )}

          {step === 5 && selectedAddress && shipping && payment && (
            <StepReview
              address={selectedAddress}
              shipping={shipping}
              payment={payment}
              isSubmitting={isSubmitting}
              error={submitError}
              onBack={() => setStep(4)}
              onSubmit={handleFinalSubmit}
            />
          )}
        </div>
      </div>

      <div className="order-1 lg:order-2">
        <CheckoutSummary shipping={shipping} />
      </div>
    </div>
  );
}
