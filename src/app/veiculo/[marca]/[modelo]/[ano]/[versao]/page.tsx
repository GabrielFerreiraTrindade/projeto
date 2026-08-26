import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CompatibleSizeSection } from "@/components/vehicle/compatible-size-section";
import { VehicleResultHeader } from "@/components/vehicle/vehicle-result-header";
import { Container } from "@/components/ui/container";
import { formatSizeLabel } from "@/lib/catalog/size-slug";
import { searchTiresBySize } from "@/lib/services/tire-search-service";
import { resolveVehicleSelection } from "@/lib/services/vehicle-search-service";

type PageParams = {
  marca: string;
  modelo: string;
  ano: string;
  versao: string;
};

async function loadResult(params: PageParams) {
  const year = Number(params.ano);
  if (!Number.isInteger(year)) return null;

  return resolveVehicleSelection({
    brandSlug: params.marca,
    modelSlug: params.modelo,
    year,
    versionSlug: params.versao,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const result = await loadResult(await params);

  if (!result) {
    return { title: "Veículo não encontrado" };
  }

  return {
    title: `Pneus para ${result.label}`,
    description: `Medidas de pneu compatíveis com ${result.label} e produtos disponíveis para entrega em Minas Gerais.`,
  };
}

export default async function VehicleTiresPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const result = await loadResult(await params);
  if (!result) {
    notFound();
  }

  const sizeSections = await Promise.all(
    result.sizes.map(async (size) => {
      const searchResult = await searchTiresBySize(size, new URLSearchParams());
      return {
        size,
        sizeLabel: formatSizeLabel(size),
        products: searchResult.tires,
        total: searchResult.total,
      };
    }),
  );

  return (
    <Container className="flex flex-col gap-10 py-8 sm:py-12">
      <VehicleResultHeader label={result.label} sizes={result.sizes} />

      {sizeSections.map((section) => (
        <CompatibleSizeSection key={section.sizeLabel} {...section} />
      ))}
    </Container>
  );
}
