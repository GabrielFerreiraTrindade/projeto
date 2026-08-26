// Constrói URLs para alternar filtros, ordenação e página preservando os
// demais parâmetros já aplicados. Usado para renderizar filtros como links
// (<Link>), sem depender de JavaScript no cliente.

// Converte o searchParams do App Router (objeto simples) em URLSearchParams,
// preservando parâmetros de múltiplos valores (ex: ?marca=A&marca=B).
export function toURLSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else {
      params.append(key, value);
    }
  }
  return params;
}

function buildHref(basePath: string, params: URLSearchParams): string {
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function clone(params: URLSearchParams): URLSearchParams {
  return new URLSearchParams(params);
}

/** Liga/desliga um valor dentro de um parâmetro de múltiplos valores (ex: marca). */
export function toggleParamHref(
  basePath: string,
  currentParams: URLSearchParams,
  key: string,
  value: string,
): string {
  const params = clone(currentParams);
  const values = params.getAll(key);

  params.delete(key);
  if (values.includes(value)) {
    values
      .filter((existing) => existing !== value)
      .forEach((existing) => params.append(key, existing));
  } else {
    values.forEach((existing) => params.append(key, existing));
    params.append(key, value);
  }
  params.delete("page");

  return buildHref(basePath, params);
}

/** Define (ou remove, se o mesmo valor já estiver ativo) um parâmetro de valor único. */
export function setSingleParamHref(
  basePath: string,
  currentParams: URLSearchParams,
  key: string,
  value: string,
): string {
  const params = clone(currentParams);
  const isActive = params.get(key) === value;

  params.delete(key);
  if (!isActive) {
    params.set(key, value);
  }
  params.delete("page");

  return buildHref(basePath, params);
}

/** Define o parâmetro de página. */
export function setPageHref(
  basePath: string,
  currentParams: URLSearchParams,
  page: number,
): string {
  const params = clone(currentParams);
  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
  return buildHref(basePath, params);
}

/** Remove todos os filtros, mantendo apenas a medida pesquisada. */
export function clearFiltersHref(basePath: string): string {
  return basePath;
}

/** Remove um único par chave/valor (usado nos chips de filtros ativos). */
export function removeParamValueHref(
  basePath: string,
  currentParams: URLSearchParams,
  key: string,
  value: string,
): string {
  return toggleParamHref(basePath, currentParams, key, value);
}
