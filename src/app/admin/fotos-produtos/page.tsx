import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { listBrandsWithModels } from "@/lib/services/product-photo-service";
import { PhotoUploadForm } from "./photo-upload-form";

export const metadata: Metadata = {
  title: "Fotos dos produtos — Admin",
  robots: { index: false, follow: false },
};

export default async function ProductPhotosPage() {
  const brandsWithModels = await listBrandsWithModels();

  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-12">
      <div>
        <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
          Fotos dos produtos
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          Escolha a marca e o modelo (ex: Bridgestone Turanza) e anexe até 3 fotos — elas são
          aplicadas de uma vez a todos os produtos daquele modelo, em qualquer medida.
        </p>
      </div>

      <div className="border-border max-w-2xl rounded-xl border p-5 sm:p-6">
        <PhotoUploadForm brandsWithModels={brandsWithModels} />
      </div>
    </Container>
  );
}
