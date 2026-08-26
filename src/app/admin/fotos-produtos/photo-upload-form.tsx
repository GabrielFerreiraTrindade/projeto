"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

import type { BrandOption, ModelOption } from "@/lib/services/product-photo-service";
import { setCoverPhotoAction, uploadModelPhotosAction } from "./actions";

const MAX_FILES = 3;

export function PhotoUploadForm({
  brandsWithModels,
}: {
  brandsWithModels: { brand: BrandOption; models: ModelOption[] }[];
}) {
  const router = useRouter();
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverUrlPending, setCoverUrlPending] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const models = brandsWithModels.find((entry) => entry.brand.id === brandId)?.models ?? [];
  const selectedModel = models.find((model) => model.id === modelId) ?? null;
  const selectedBrandName = brandsWithModels.find((e) => e.brand.id === brandId)?.brand.name;

  const previewUrls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []).slice(0, MAX_FILES);
    setFiles(selected);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!modelId || files.length === 0) return;

    setIsSubmitting(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.set("tireModelId", modelId);
      files.forEach((file) => formData.append("photos", file));

      const result = await uploadModelPhotosAction(formData);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else if (result.success) {
        setMessage({ type: "success", text: result.success });
        setFiles([]);
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSetCover(url: string) {
    if (!modelId) return;
    setCoverUrlPending(url);
    setMessage(null);
    try {
      const result = await setCoverPhotoAction(modelId, url);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else if (result.success) {
        setMessage({ type: "success", text: result.success });
        router.refresh();
      }
    } finally {
      setCoverUrlPending(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">Marca</span>
          <select
            value={brandId}
            onChange={(event) => {
              setBrandId(event.target.value);
              setModelId("");
              setFiles([]);
              setMessage(null);
            }}
            className="border-border bg-background text-foreground h-11 rounded-md border px-3 text-sm"
          >
            <option value="">Selecione a marca</option>
            {brandsWithModels.map(({ brand }) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">Modelo</span>
          <select
            value={modelId}
            disabled={!brandId}
            onChange={(event) => {
              setModelId(event.target.value);
              setFiles([]);
              setMessage(null);
            }}
            className="border-border bg-background text-foreground h-11 rounded-md border px-3 text-sm disabled:opacity-50"
          >
            <option value="">Selecione o modelo</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.productCount} medidas
                {model.images.length > 0 ? " · com foto" : " · sem foto"})
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedModel && (
        <div className="border-border bg-secondary flex flex-col gap-3 rounded-xl border p-4">
          <p className="text-muted-foreground text-xs">
            Fotos atuais de {selectedBrandName} {selectedModel.name} — aplicadas aos{" "}
            {selectedModel.productCount} produto(s) deste modelo (todas as medidas). Clique numa
            foto para torná-la a capa (a que aparece nos cards e no carrinho).
          </p>
          {selectedModel.images.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {selectedModel.images.map((url, index) => {
                const isCover = index === 0;
                return (
                  <div key={url} className="flex flex-col items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSetCover(url)}
                      disabled={isCover || coverUrlPending !== null}
                      className={`relative h-24 w-24 overflow-hidden rounded-lg bg-white ring-2 disabled:cursor-default ${
                        isCover ? "ring-accent" : "ring-transparent hover:ring-border"
                      }`}
                    >
                      <Image
                        src={url}
                        alt={selectedModel.name}
                        fill
                        sizes="96px"
                        className="object-contain p-1"
                      />
                      {coverUrlPending === url && (
                        <span className="bg-background/70 absolute inset-0 flex items-center justify-center text-xs">
                          Aplicando...
                        </span>
                      )}
                    </button>
                    <span
                      className={`flex items-center gap-1 text-xs font-medium ${
                        isCover ? "text-accent" : "text-muted-foreground"
                      }`}
                    >
                      {isCover && <Star className="h-3 w-3 fill-current" aria-hidden />}
                      {isCover ? "Capa" : "Tornar capa"}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nenhuma foto ainda.</p>
          )}
        </div>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-foreground text-sm font-medium">
          Novas fotos (até {MAX_FILES}, JPG/PNG/WebP) — substituem as fotos atuais deste modelo
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={!modelId}
          onChange={handleFilesChange}
          className="text-foreground text-sm disabled:opacity-50"
        />
      </label>

      {previewUrls.length > 0 && (
        <div className="flex gap-3">
          {previewUrls.map((url, index) => (
            // eslint-disable-next-line @next/next/no-img-element -- preview de arquivo local (blob:), não passa pelo otimizador do Next.
            <img
              key={url}
              src={url}
              alt={`Pré-visualização ${index + 1}`}
              className="border-border h-20 w-20 rounded-lg border object-contain bg-white"
            />
          ))}
        </div>
      )}

      {message && (
        <p
          className={
            message.type === "success"
              ? "rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800"
              : "rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          }
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={!modelId || files.length === 0 || isSubmitting}
        className="bg-accent text-accent-foreground w-fit rounded-lg px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {isSubmitting ? "Enviando..." : "Aplicar em todas as medidas deste modelo"}
      </button>
    </form>
  );
}
