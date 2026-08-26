"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Select } from "@/components/ui/select";

export function SortSelect({
  current,
  options,
}: {
  current: string;
  options: { value: string; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "relevancia") {
      params.delete("ordenar");
    } else {
      params.set("ordenar", value);
    }
    params.delete("page");

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <Select
      aria-label="Ordenar por"
      value={current}
      onChange={(event) => handleChange(event.target.value)}
      className="w-auto min-w-[10rem]"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}
