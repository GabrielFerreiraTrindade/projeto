"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export type TabItem = {
  value: string;
  label: string;
  content: React.ReactNode;
};

export function Tabs({
  items,
  defaultValue,
  className,
}: {
  items: TabItem[];
  defaultValue?: string;
  className?: string;
}) {
  const [active, setActive] = useState(defaultValue ?? items[0]?.value);

  return (
    <div className={className}>
      <div role="tablist" className="bg-muted inline-flex gap-1 rounded-lg p-1">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active === item.value}
            onClick={() => setActive(item.value)}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              active === item.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {items.find((item) => item.value === active)?.content}
      </div>
    </div>
  );
}
