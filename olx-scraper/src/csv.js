function escapeField(value) {
  const str = String(value ?? '');
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converte uma lista de objetos em texto CSV (separador ";", amigavel ao Excel BR).
 */
export function toCsv(rows, colunas) {
  const header = colunas.join(';');
  const linhas = rows.map((row) => colunas.map((col) => escapeField(row[col])).join(';'));
  return [header, ...linhas].join('\n');
}
