export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

// Validação de CPF pelo algoritmo padrão dos dígitos verificadores.
export function isValidCpf(rawCpf: string): boolean {
  const cpf = onlyDigits(rawCpf);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcCheckDigit = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += Number(cpf[i]) * (length + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return (
    calcCheckDigit(9) === Number(cpf[9]) &&
    calcCheckDigit(10) === Number(cpf[10])
  );
}

export function formatCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** Exibe o CPF parcialmente oculto (ex: perfil do usuário). */
export function maskCpf(cpf: string): string {
  const digits = onlyDigits(cpf);
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.***.***-${digits.slice(9)}`;
}
