"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { createAddressAction } from "./actions";
import { AddressForm } from "./address-form";

export function NewAddressSection() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-fit gap-2"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Adicionar endereço
      </Button>
    );
  }

  return (
    <div className="border-border rounded-xl border p-5">
      <h2 className="text-foreground mb-4 text-lg font-semibold">
        Novo endereço
      </h2>
      <AddressForm
        action={createAddressAction}
        onCancel={() => setIsOpen(false)}
      />
    </div>
  );
}
