export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length === 0) return "";

  const ddd = digits.slice(0, 2);
  if (digits.length < 3) return `(${ddd}`;

  const rest = digits.slice(2);
  const isMobile = rest.length > 8; // 9 dígitos = celular, 8 = fixo
  const prefixLength = isMobile ? 5 : 4;
  const prefix = rest.slice(0, prefixLength);
  const suffix = rest.slice(prefixLength);

  return suffix ? `(${ddd}) ${prefix}-${suffix}` : `(${ddd}) ${prefix}`;
}
