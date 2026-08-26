# Pesquisa do catálogo inicial (10 marcas / medidas prioritárias)

Relatório da pesquisa usada para configurar `TOP_TIRE_BRANDS`
(`src/lib/catalog/top-brands.ts`) e `TIRE_SIZE_DEMAND_SEED`
(`src/lib/catalog/tire-size-demand-data.ts`). Feito via busca e leitura de
páginas públicas (nunca contornando login, CAPTCHA, robots.txt ou
rate limit) — ver seção "Limitações" no fim.

## TOP 10 MARCAS

Nenhuma fonte encontrada publica um ranking oficial e verificável de
participação de mercado por marca no Brasil (a ANIP/Sindipneus publicam
volume agregado do setor, não por marca). As 10 marcas abaixo foram
escolhidas por terem, cada uma, pelo menos uma evidência concreta de
presença/relevância comercial no Brasil e, quando encontrada, em Minas
Gerais — não por serem simplesmente famosas.

| # | Marca | Participação/relevância encontrada | Evidência | Fonte | Observação |
|---|---|---|---|---|---|
| 1 | Pirelli | Citada como uma das 3 mais vendidas do Brasil | "As três marcas de pneus mais vendidas no Brasil são: Pirelli, Bridgestone e Goodyear" | [blog.usezapay.com.br](https://blog.usezapay.com.br/veiculo/marcas-de-pneu), [Full Pneus](https://www.fullpneus.com.br/marcas-de-pneus-mais-vendidas), [pneus.org/ranking](https://www.pneus.org/ranking) (1º lugar no ranking por critérios técnicos/INMETRO) | Distribuída em MG pela ZR Pneus ([zrpneus.com.br](https://zrpneus.com.br/)). Volume de vendas real não disponível publicamente. |
| 2 | Bridgestone | Citada como uma das 3 mais vendidas do Brasil | Mesma citação acima | usezapay, Full Pneus, pneus.org (9º no ranking técnico) | Loja/revendedor próprio listado para Belo Horizonte e outras cidades de MG ([bridgestone.com.br](https://www.bridgestone.com.br/lojas-de-pneus/minas-gerais/belo-horizonte/)); também distribuída pela ZR Pneus. |
| 3 | Goodyear | Citada como uma das 3 mais vendidas do Brasil | Mesma citação acima | usezapay, Full Pneus (3º lugar), pneus.org (5º no ranking técnico) | Volume de vendas real não disponível publicamente. |
| 4 | Michelin | Citada entre as principais marcas de reputação/qualidade no Brasil | "Marca de origem francesa, reputação sólida e alta qualidade" | Full Pneus (4º lugar), pneus.org (4º no ranking técnico) | Volume de vendas real não disponível publicamente. |
| 5 | Continental | Linha PowerContact 2 descrita como "a linha mais vendida da marca no Brasil" | Afirmação explícita de venda (única encontrada nesta pesquisa citando liderança de vendas de uma linha específica) | [Blog Pneuscarmg](https://www.pneuscarmg.com.br/blog/continental-powercontact-ou-ultracontact/) (fonte de varejo, não do fabricante) | pneus.org classifica a marca em 2º no ranking técnico. |
| 6 | Yokohama | Citada entre as 5 marcas mais vendidas do Brasil | "Presente em mais de 120 países, ampla linha de produtos" | Full Pneus (5º lugar), motorshow.com.br | Volume de vendas real não disponível publicamente. |
| 7 | Dunlop | Produção local em larga escala confirmada pela associação do setor | "Dunlop supera marca de 51 milhões de pneus produzidos no Brasil" | [ANIP — release oficial](https://www.anip.org.br/releases/dunlop-supera-marca-de-51-milhoes-de-pneus-produzidos-no-brasil/) | Fonte confirma produção, não participação de mercado por vendas. |
| 8 | Firestone | Rede de lojas própria dedicada a Minas Gerais/Belo Horizonte | Página oficial de revendedores por cidade de MG | [firestone.com.br/lojas-de-pneus/minas-gerais](https://www.firestone.com.br/lojas-de-pneus/minas-gerais/) | Marca do grupo Bridgestone; distribuída também pela ZR Pneus em MG. |
| 9 | Hankook | Distribuída oficialmente em Minas Gerais (atacado e varejo) | "Distribuidor oficial Bridgestone, Firestone, Hankook e Laufenn em BH e região" | [zrpneus.com.br](https://zrpneus.com.br/), catálogo oficial [hankooktire.com/br](https://www.hankooktire.com/br/pt/home.html) | Volume de vendas real não disponível publicamente. |
| 10 | Xbri | Marca brasileira "ganhando espaço" segundo cobertura do setor | "Marcas como Xbri e Yokohama ganham espaço devido a preços competitivos" | [motorshow.com.br](https://motorshow.com.br/pneus-10-marcas-representam-51-do-mercado-nacional-no-online/), classificada como "Brasil, Econômica" em [pneus.org/ranking](https://www.pneus.org/ranking) | Fabricada pela Sunset Tires, descrita como líder de mercado no Paraguai. Volume de vendas no Brasil não disponível publicamente. |

**Limitação explícita:** não há dado público e verificável de participação
de mercado (%) por marca no Brasil. As 10 marcas acima foram selecionadas
por evidência de presença comercial (citações recorrentes em múltiplas
fontes independentes, distribuição confirmada em MG, produção industrial
confirmada, ou uma afirmação explícita de liderança de vendas de uma linha
específica) — não por um ranking numérico. Marcas com presença comprovada
apenas em uma única fonte de distribuição em MG (ex: Nexen, Laufenn, também
listadas pela ZR Pneus) não entraram no top 10 por terem evidência mais
fraca (uma fonte só) do que as 10 escolhidas.

## TOP MEDIDAS

14 medidas, todas com pelo menos uma fonte pública associando-as à
popularidade no Brasil. `minasGeraisRelevance` nunca é maior do que a
evidência nacional: nenhuma fonte encontrada quebra demanda por medida por
estado — o valor repete a relevância nacional com essa limitação registrada
explicitamente em `sources` (ver `src/lib/catalog/tire-size-demand-data.ts`).

| Medida | Demanda | Relevância Brasil | Relevância MG | Evidência |
|---|---|---|---|---|
| 175/65 R14 | Alta | Alta | Alta (inferida) | Fiat Palio, Ford Fiesta, VW Gol, Renault Clio — [Full Pneus](https://www.fullpneus.com.br/quais-as-medidas-de-pneus-mais-vendidos-de-carros-de-passeio-confira) |
| 175/70 R14 | Alta | Alta | Alta (inferida) | Compactos de entrada — mesma fonte + [Griffe Pneus](https://griffepneus.com.br/dicas-pneus/pneu-aro-14-principais-caracteristicas-e-em-quais-carros-e-mais-usado/) |
| 185/65 R15 | Alta | Alta | Alta (inferida) | [Full Pneus](https://www.fullpneus.com.br/quais-os-pneus-e-medidas-mais-usados-no-mercado-brasileiro) |
| 195/55 R15 | Média | Média | Média (inferida) | Full Pneus |
| 195/60 R15 | Média | Média | Média (inferida) | Full Pneus |
| 195/65 R15 | Alta | Alta | Alta (inferida) | Chevrolet Onix, Hyundai HB20, Toyota Corolla, VW Golf — Full Pneus |
| 205/55 R16 | Média | Média | Média (inferida) | Full Pneus |
| 205/60 R16 | Média | Média | Média (inferida) | Full Pneus |
| 205/65 R15 | Média | Média | Média (inferida) | Full Pneus |
| 205/65 R16 | Alta | Alta | Alta (inferida) | Hyundai Creta, Renault Duster, Nissan Kicks |
| 215/55 R17 | Média | Média | Média (inferida) | Full Pneus |
| 225/45 R17 | Média | Média | Média (inferida) | Full Pneus |
| 215/60 R17 | Média | Média | Média (inferida) | Página própria de catálogo por medida no site da Pirelli |
| 225/65 R17 | Alta | Alta | Alta (inferida) | Hyundai Tucson, Honda CR-V, Toyota RAV4, Nissan X-Trail; página própria de catálogo por medida na Pirelli |

"(inferida)" = sem fonte específica de Minas Gerais; o valor repete a
relevância nacional porque MG é a 3ª maior frota de veículos do Brasil
(~12,4 milhões, segundo CET-MG/Diário do Comércio), não por um dado direto
de vendas por medida no estado.

## PRODUTOS SELECIONADOS (modelos por marca)

No máximo 2 linhas reais por marca, aplicadas a todas as 14 medidas acima
(280 produtos no total). Cada linha é um produto real e publicamente
documentado; "Volume de vendas não disponível publicamente" para todas,
exceto onde indicado.

| Marca | Modelo 1 | Modelo 2 | Fonte/evidência |
|---|---|---|---|
| Pirelli | Cinturato P1 | Scorpion Verde | Citada como "Cinturato P1 Plus" entre os pneus mais vendidos (usezapay); Scorpion Verde é a linha SUV documentada no catálogo oficial. |
| Bridgestone | Turanza | Ecopia | Linhas touring/eco documentadas no catálogo oficial da marca. |
| Goodyear | Assurance | EfficientGrip Performance | Linhas de conforto/eficiência documentadas no catálogo oficial. |
| Michelin | Primacy 4 | Energy XM2+ | Linhas documentadas no catálogo oficial; Primacy 4 já era produto de demonstração desta loja. |
| Continental | PowerContact 2 | UltraContact | PowerContact 2 = "linha mais vendida da marca no Brasil" ([Pneuscarmg](https://www.pneuscarmg.com.br/blog/continental-powercontact-ou-ultracontact/)); UltraContact é o lançamento mais recente ([O Mecânico](https://omecanico.com.br/continental-lanca-linha-de-pneus-ultracontact-com-garantia-adicional-de-80-mil-km/)). |
| Yokohama | BluEarth-ES ES32 | Ecos ES31 | Linhas de conforto/entrada documentadas no catálogo global da marca. |
| Dunlop | SP Touring R1 | SP Sport FastResponse | Linhas touring/esportiva documentadas no catálogo oficial. |
| Firestone | F-600 | Multihawk 2 | F-600 já era produto de demonstração desta loja; Multihawk 2 documentada no catálogo oficial. |
| Hankook | Kinergy GT H436 | Optimo H724 | Catálogo oficial [hankooktire.com/br](https://www.hankooktire.com/br/pt/tirelist/brand-family/kinergy.html) (família Kinergy) e lista de modelos Optimo. |
| Xbri | Ecology | Sport+2 | Linhas mais documentadas em lojas/avaliações (PneusBH, Mercado Livre, blogs especializados). |

### Modelos reais que ficaram de fora por causa do limite de 2 por marca

Exemplos concretos onde a marca tem mais de 2 linhas reais documentadas,
mas só 2 entraram no catálogo:

- **Xbri**: além de Ecology e Sport+2, a marca também comercializa Brutus
  T/A, Fastway e Cargoplus — não importados.
- **Hankook**: além de Kinergy GT H436 e Optimo H724, o catálogo oficial
  lista também Kinergy PT H737, Kinergy ST H735, Kinergy XP H446, Optimo
  H426, H426B, H428, H725A e H727 — não importados.
- **Dunlop**: linhas adicionais como SP Sport Maxx não foram importadas.

Cada uma das 14 medidas segue a mesma regra: cada marca aparece só com as
mesmas 2 linhas fixas acima, nunca uma terceira.

### Dados técnicos (índice de carga/velocidade)

Usam combinações padrão de engenharia por medida (tabela pública do setor,
não uma ficha técnica individual de um fabricante específico verificada
produto a produto) — registrado em `ProductSource.note` de cada produto.

## FOTOS

O cliente (dono da loja) confirmou ser parceiro/revendedor autorizado das
10 marcas do catálogo, com permissão para usar as fotos publicadas pelos
próprios fabricantes para fins de venda dos produtos. Com base nisso, para
cada modelo foi coletado o conjunto de fotos reais disponível na página
oficial do fabricante (ou de sua loja oficial no Brasil), aplicado a
**todas** as medidas daquele mesmo modelo/marca (mesma foto em todas as 23
medidas, conforme pedido). Ver `src/lib/catalog/model-images.ts` para o
mapeamento e `ProductSource` de cada produto para a URL de origem
específica.

| Marca | Fotos por modelo | Fonte | Situação |
|---|---|---|---|
| Pirelli | 1 por modelo | tyre24.pirelli.com (CDN oficial) | Coletado |
| Goodyear | 3 por modelo (perspectiva/banda de rodagem/lateral) | goodyear.lat (CDN oficial) | Coletado |
| Michelin | 3 por modelo | contentcenter.michelin.com (CDN oficial) | Coletado |
| Continental | 1 por modelo | conti.com.br (CDN oficial) | Coletado |
| Hankook | 2 por modelo | hankooktire.com (CDN oficial) | Coletado |
| Xbri | 1 por modelo | cdn.pneufree.com.br (loja oficial) | Coletado |
| Dunlop | — | dunloppneus.com.br | **Não coletado**: a CDN de imagens (vtexassets.com) respondeu com HTTP 429 (limite de requisições) em duas tentativas, inclusive após esperar antes de tentar de novo. Continuar tentando seria scraping agressivo — produtos permanecem `PENDING_PERMISSION`. |
| Bridgestone | — | bridgestone.com.br | **Não coletado**: o site respondeu HTTP 403 (bloqueio). Não foi feita nenhuma tentativa de contornar o bloqueio — produtos permanecem `PENDING_PERMISSION`. |
| Firestone | — | firestone.com.br | **Não coletado**: mesmo bloqueio HTTP 403 (mesmo grupo da Bridgestone). Produtos permanecem `PENDING_PERMISSION`. |
| Yokohama | — | yokohama.com.br | **Não coletado**: a própria página oficial do produto exibe "a imagem não foi cadastrada!" — a imagem está quebrada na origem, não é um bloqueio. Produtos permanecem `PENDING_PERMISSION`. |

Resultado: **276 de 460 produtos** (Pirelli, Goodyear, Michelin,
Continental, Hankook, Xbri) com foto autorizada (`imageStatus =
MANUFACTURER_AUTHORIZED`); **184 produtos** (Bridgestone, Yokohama, Dunlop,
Firestone) continuam `PENDING_PERMISSION` por razões técnicas específicas
de cada site, não por falta de autorização do cliente.

## LIMITAÇÕES

- Não existe estatística pública oficial de participação de mercado por
  marca no Brasil, nem de volume de vendas por medida ou por modelo — em
  nenhum dos dois casos um número foi inventado; onde não há dado, o campo
  correspondente é `UNKNOWN` (ver `ProductScore.salesVolume` no schema) ou
  o texto "Volume de vendas não disponível publicamente".
- `minasGeraisRelevance` é sempre uma inferência a partir da relevância
  nacional + tamanho da frota de MG, nunca um dado direto por estado.
- Preço, estoque e SKU de cada produto são fictícios, gerados para popular
  o sistema com uma base de teste (ver seção 20 do pedido original) — não
  são preços de mercado pesquisados.
- Todas as imagens estão como `PENDING_PERMISSION`: nenhuma imagem de
  fabricante/concorrente foi baixada ou reutilizada.
