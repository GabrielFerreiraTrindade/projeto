# olx-scraper

Busca anuncios de carros na OLX (por marca/modelo, faixa de preco e estado) e salva as URLs dos anuncios em um arquivo CSV.

Funciona buscando as paginas de resultado publicas da OLX via HTTP e extraindo os dados do HTML — sem login, sem navegador headless.

## Instalacao

```bash
cd olx-scraper
npm install
```

## Uso

```bash
node src/cli.js --marca Volkswagen --modelo Gol --preco-min 20000 --preco-max 40000 --uf sp --paginas 3
```

Opcoes disponiveis: `node src/cli.js --ajuda`

| Opcao | Descricao |
|---|---|
| `--marca` | Marca do carro (ex: Volkswagen) |
| `--modelo` | Modelo do carro (ex: Gol) |
| `--texto` | Busca livre, alternativa a marca+modelo |
| `--preco-min` / `--preco-max` | Faixa de preco em R$ |
| `--uf` | Sigla do estado (sp, rj, mg...). Sem isso, busca em todo o Brasil |
| `--paginas` | Quantidade de paginas (cada uma tem ate ~50 anuncios). Padrao: 1 |
| `--saida` | Caminho do CSV de saida. Padrao: `output/olx-<busca>-<data>.csv` |
| `--delay` | Intervalo entre requisicoes de paginas, em ms. Padrao: 1500 |

O CSV gerado tem as colunas: `url`, `titulo`, `preco`, `localizacao`, `data`.

## Observacoes

- Este script acessa apenas paginas publicas de busca, sem burlar login ou captcha.
- A OLX pode bloquear requisicoes automatizadas se forem feitas com muita frequencia — o `--delay` existe para evitar isso. Se receber erro de bloqueio, aguarde antes de tentar novamente.
- A estrutura do HTML da OLX pode mudar a qualquer momento e quebrar o parser (`src/olx.js`).
