#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buscarAnuncios } from './olx.js';
import { toCsv } from './csv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { values } = parseArgs({
  options: {
    marca: { type: 'string' },
    modelo: { type: 'string' },
    texto: { type: 'string' }, // busca livre, usada se marca/modelo nao forem suficientes
    'preco-min': { type: 'string' },
    'preco-max': { type: 'string' },
    uf: { type: 'string' }, // ex: sp, rj, mg
    paginas: { type: 'string', default: '1' },
    saida: { type: 'string' },
    delay: { type: 'string', default: '1500' },
    ajuda: { type: 'boolean', default: false },
  },
});

if (values.ajuda) {
  console.log(`
Uso: node src/cli.js [opcoes]

  --marca <nome>       Marca do carro (ex: Volkswagen)
  --modelo <nome>       Modelo do carro (ex: Gol)
  --texto <texto>       Busca livre (alternativa/complemento a marca+modelo)
  --preco-min <valor>    Preco minimo em R$
  --preco-max <valor>    Preco maximo em R$
  --uf <sigla>         Estado, ex: sp, rj, mg (padrao: Brasil todo)
  --paginas <n>         Quantidade de paginas a buscar (padrao: 1, ~50 anuncios/pagina)
  --saida <arquivo.csv>   Caminho do arquivo CSV de saida
  --delay <ms>          Intervalo entre paginas em ms (padrao: 1500)
  --ajuda            Mostra esta mensagem

Exemplo:
  node src/cli.js --marca Volkswagen --modelo Gol --preco-min 20000 --preco-max 40000 --uf sp --paginas 3
`);
  process.exit(0);
}

const query = values.texto || [values.marca, values.modelo].filter(Boolean).join(' ') || undefined;
const precoMin = values['preco-min'] ? Number(values['preco-min']) : undefined;
const precoMax = values['preco-max'] ? Number(values['preco-max']) : undefined;
const paginas = Number(values.paginas);
const delayMs = Number(values.delay);

if (!query) {
  console.error('Informe pelo menos --marca, --modelo ou --texto para a busca.');
  process.exit(1);
}

const outputDir = path.join(__dirname, '..', 'output');
await mkdir(outputDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const saida = values.saida || path.join(outputDir, `olx-${slug}-${timestamp}.csv`);

console.log(`Buscando "${query}"${values.uf ? ` em ${values.uf.toUpperCase()}` : ''}...`);

const anuncios = await buscarAnuncios({
  query,
  uf: values.uf,
  precoMin,
  precoMax,
  paginas,
  delayMs,
  onPage: ({ pagina, encontrados }) => {
    console.log(`  pagina ${pagina}: ${encontrados} anuncio(s) novo(s)`);
  },
});

if (anuncios.length === 0) {
  console.log('Nenhum anuncio encontrado.');
  process.exit(0);
}

const csv = toCsv(anuncios, ['url', 'titulo', 'preco', 'localizacao', 'data']);
await writeFile(saida, csv, 'utf-8');

console.log(`\n${anuncios.length} anuncio(s) salvo(s) em: ${saida}`);
