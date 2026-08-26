import type { TireSize } from "@/types/catalog";

const SLUG_PATTERN = /^(\d{2,3})-(\d{2,3})-r(\d{2})$/i;

// "185-65-r15" -> { width: 185, aspectRatio: 65, rimDiameter: 15 }
export function parseSizeSlug(slug: string): TireSize | null {
  const match = SLUG_PATTERN.exec(slug.trim().toLowerCase());
  if (!match) return null;

  const [, width, aspectRatio, rimDiameter] = match;
  return {
    width: Number(width),
    aspectRatio: Number(aspectRatio),
    rimDiameter: Number(rimDiameter),
  };
}

// { width: 185, aspectRatio: 65, rimDiameter: 15 } -> "185-65-r15"
export function formatSizeSlug(size: TireSize): string {
  return `${size.width}-${size.aspectRatio}-r${size.rimDiameter}`;
}

// { width: 185, aspectRatio: 65, rimDiameter: 15 } -> "185/65 R15"
export function formatSizeLabel(size: TireSize): string {
  return `${size.width}/${size.aspectRatio} R${size.rimDiameter}`;
}
