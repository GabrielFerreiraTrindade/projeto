"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCpf } from "@/lib/auth/cpf";
import { formatPhone } from "@/lib/auth/phone";

export type IdentificationData = {
  name: string;
  document: string;
  email: string;
  phone: string;
};

export function StepIdentification({
  initial,
  onNext,
}: {
  initial: IdentificationData;
  onNext: (data: IdentificationData) => void;
}) {
  const [name, setName] = useState(initial.name);
  const [document, setDocument] = useState(formatCpf(initial.document));
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(formatPhone(initial.phone));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onNext({ name, document, email, phone });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">Identificação</h2>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="checkout-name" className="text-sm font-medium text-foreground">
          Nome completo
        </label>
        <Input id="checkout-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="checkout-document" className="text-sm font-medium text-foreground">
            CPF/CNPJ
          </label>
          <Input
            id="checkout-document"
            value={document}
            onChange={(e) => setDocument(formatCpf(e.target.value))}
            inputMode="numeric"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="checkout-phone" className="text-sm font-medium text-foreground">
            Telefone
          </label>
          <Input
            id="checkout-phone"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            inputMode="numeric"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="checkout-email" className="text-sm font-medium text-foreground">
          E-mail
        </label>
        <Input
          id="checkout-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Continuar
      </Button>
    </form>
  );
}
