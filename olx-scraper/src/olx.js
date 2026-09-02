import * as cheerio from 'cheerio';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const BASE_URL = 'https://www.olx.com.br/autos-e-pecas/carros-vans-e-utilitarios';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

/**
 * Monta a URL de busca da OLX a partir dos filtros informados.
 * @param {{query?: string, uf?: string, precoMin?: number, precoMax?: number, pagina?: number}} filtros
 */
export function buildSearchUrl({ query, uf, precoMin, precoMax, pagina } = {}) {
  let path = BASE_URL;
  if (uf) path += `/estado-${uf.toLowerCase()}`;

  const url = new URL(path);
  if (query) url.searchParams.set('q', query);
  if (precoMin != null) url.searchParams.set('ps', String(precoMin));
  if (precoMax != null) url.searchParams.set('pe', String(precoMax));
  if (pagina && pagina > 1) url.searchParams.set('o', String(pagina));

  return url.toString();
}

/**
 * Busca uma pagina de resultados e retorna o HTML.
 *
 * Usa o curl do sistema (em vez do fetch nativo do Node) porque a OLX usa
 * deteccao de bot baseada em fingerprint de TLS/HTTP2 via Cloudflare: o
 * fetch/undici do Node leva 403 mesmo com headers identicos aos de um
 * navegador, enquanto o curl passa. Isso apenas acessa paginas publicas de
 * busca, sem burlar login ou captcha.
 */
async function fetchPage(url) {
  let stdout;
  try {
    ({ stdout } = await execFileAsync(
      'curl.exe',
      [
        '-s',
        '-L',
        '--compressed',
        '-A',
        USER_AGENT,
        '-H',
        'Accept-Language: pt-BR,pt;q=0.9',
        url,
      ],
      { maxBuffer: 20 * 1024 * 1024, encoding: 'utf-8' }
    ));
  } catch (err) {
    throw new Error(`Falha ao executar curl para acessar a OLX: ${err.message}`);
  }

  if (!stdout || stdout.includes('Attention Required') || stdout.includes('cf-error-details')) {
    throw new Error(
      'Falha ao acessar a OLX. O site pode ter bloqueado a requisicao automatizada temporariamente — tente novamente mais tarde ou reduza a frequencia.'
    );
  }

  return stdout;
}

/**
 * Extrai os anuncios de uma pagina de resultados HTML.
 * @returns {{url: string, titulo: string, preco: string, localizacao: string, data: string}[]}
 */
export function parseAds(html) {
  const $ = cheerio.load(html);
  const anuncios = [];

  $('section.olx-adcard').each((_, el) => {
    const card = $(el);
    const link = card.find('a[data-testid="adcard-link"]').first();
    const url = link.attr('href');
    if (!url) return;

    const titulo = link.attr('title')?.trim() || link.find('h2').first().text().trim();
    const preco = card.find('h3').first().text().trim();
    const localizacao = card.find('.olx-adcard__location').first().text().trim();
    const data = card.find('.olx-adcard__date').first().text().trim();

    anuncios.push({ url, titulo, preco, localizacao, data });
  });

  return anuncios;
}

/**
 * Busca varias paginas de anuncios, respeitando um intervalo entre requisicoes.
 * @param {{query?: string, uf?: string, precoMin?: number, precoMax?: number, paginas?: number, delayMs?: number, onPage?: (info: {pagina: number, encontrados: number}) => void}} opcoes
 */
export async function buscarAnuncios({
  query,
  uf,
  precoMin,
  precoMax,
  paginas = 1,
  delayMs = 1500,
  onPage,
} = {}) {
  const vistos = new Set();
  const resultado = [];

  for (let pagina = 1; pagina <= paginas; pagina++) {
    const url = buildSearchUrl({ query, uf, precoMin, precoMax, pagina });
    const html = await fetchPage(url);
    const anuncios = parseAds(html);

    let novos = 0;
    for (const anuncio of anuncios) {
      if (vistos.has(anuncio.url)) continue;
      vistos.add(anuncio.url);
      resultado.push(anuncio);
      novos++;
    }

    onPage?.({ pagina, encontrados: novos });

    if (anuncios.length === 0) break; // sem mais resultados
    if (pagina < paginas) await sleep(delayMs);
  }

  return resultado;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
