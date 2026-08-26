// Fotos autorizadas por modelo de pneu, aplicadas a TODAS as medidas
// daquele mesmo modelo/marca (o mesmo conjunto de imagens se repete em
// todas as 23 medidas — pedido explícito: "pegar um conjunto de fotos de
// uma medida diferente... e copiá-las em todas outras medidas desse mesmo
// modelo de pneu dessa marca").
//
// Base legal: o cliente (dono desta loja) confirmou ser parceiro/revendedor
// autorizado das marcas do catálogo e ter permissão para usar as fotos
// publicadas pelos próprios fabricantes para fins de venda dos produtos.
// As imagens abaixo foram obtidas diretamente do site oficial de cada
// fabricante (ou de sua loja oficial no Brasil) nessa condição — ver
// ProductSource de cada produto para a URL de origem específica.
//
// Bridgestone, Firestone e Yokohama ficaram de fora: os sites da
// Bridgestone/Firestone bloqueiam requisição automatizada (HTTP 403) e o
// site da Yokohama Brasil está com a imagem do produto quebrada
// ("a imagem não foi cadastrada!") no momento da coleta — nenhuma imagem
// foi usada para essas marcas, permanecem PENDING_PERMISSION.
export type ModelImageSet = {
  brandName: string;
  tireModelSlug: string;
  sourceUrl: string;
  images: string[];
};

export const MODEL_IMAGES: ModelImageSet[] = [
  {
    brandName: "Pirelli",
    tireModelSlug: "cinturato-p1",
    sourceUrl: "https://www.pirelli.com/tyres/pt-br/carro/catalogo-pneus/produto/cinturato-p1",
    images: ["/product-images/pirelli/cinturato-p1/1.png"],
  },
  {
    brandName: "Pirelli",
    tireModelSlug: "scorpion-verde",
    sourceUrl: "https://www.pirelli.com/tyres/pt-br/carro/catalogo-pneus/produto/scorpion-verde",
    images: ["/product-images/pirelli/scorpion-verde/1.png"],
  },
  {
    brandName: "Goodyear",
    tireModelSlug: "assurance",
    sourceUrl: "https://www.goodyear.com.br/tire-details/assurance",
    images: [
      "/product-images/goodyear/assurance/1.png",
      "/product-images/goodyear/assurance/2.png",
      "/product-images/goodyear/assurance/3.png",
    ],
  },
  {
    brandName: "Goodyear",
    tireModelSlug: "efficientgrip-performance",
    sourceUrl: "https://www.goodyear.com.br/tire-details/efficientgrip-performance",
    images: [
      "/product-images/goodyear/efficientgrip-performance/1.png",
      "/product-images/goodyear/efficientgrip-performance/2.png",
      "/product-images/goodyear/efficientgrip-performance/3.png",
    ],
  },
  {
    brandName: "Michelin",
    tireModelSlug: "primacy-4",
    sourceUrl: "https://www.michelin.com.br/auto/tyres/michelin-primacy-4",
    images: [
      "/product-images/michelin/primacy-4/1.webp",
      "/product-images/michelin/primacy-4/2.webp",
      "/product-images/michelin/primacy-4/3.webp",
    ],
  },
  {
    brandName: "Michelin",
    tireModelSlug: "energy-xm2",
    sourceUrl: "https://www.michelin.com.br/auto/tyres/michelin-energy-xm2-plus",
    images: [
      "/product-images/michelin/energy-xm2/1.webp",
      "/product-images/michelin/energy-xm2/2.webp",
      "/product-images/michelin/energy-xm2/3.webp",
    ],
  },
  {
    brandName: "Continental",
    tireModelSlug: "powercontact-2",
    sourceUrl: "https://www.conti.com.br/products/car/tires/powercontact-2/",
    images: ["/product-images/continental/powercontact-2/1.webp"],
  },
  {
    brandName: "Continental",
    tireModelSlug: "ultracontact",
    sourceUrl: "https://www.conti.com.br/products/car/tires/ultracontact/",
    images: ["/product-images/continental/ultracontact/1.webp"],
  },
  // Dunlop ficou de fora: a CDN de imagens da loja oficial
  // (dunloppneus.vtexassets.com) respondeu com HTTP 429 (rate limit) nas
  // tentativas de download, inclusive após esperar e tentar de novo uma
  // única vez. Continuar tentando seria scraping agressivo — os produtos
  // Dunlop permanecem PENDING_PERMISSION.
  {
    brandName: "Hankook",
    tireModelSlug: "kinergy-gt-h436",
    sourceUrl: "https://www.hankooktire.com/br/pt/tire/kinergy/gt-h436.html",
    images: [
      "/product-images/hankook/kinergy-gt-h436/1.png",
      "/product-images/hankook/kinergy-gt-h436/2.jpg",
    ],
  },
  {
    brandName: "Hankook",
    tireModelSlug: "optimo-h724",
    sourceUrl: "https://www.hankooktire.com/br/pt/tire/etc/optimoh724-h724.html",
    images: [
      "/product-images/hankook/optimo-h724/1.png",
      "/product-images/hankook/optimo-h724/2.jpg",
    ],
  },
  {
    brandName: "Xbri",
    tireModelSlug: "ecology",
    sourceUrl: "https://xbri.com.br/pneu/pneu-175-65r15-84h-ecology-xbri",
    images: ["/product-images/xbri/ecology/1.jpg"],
  },
  {
    brandName: "Xbri",
    tireModelSlug: "sport-plus-2",
    sourceUrl: "https://xbri.com.br/pneu/pneu-205-50r16-91w-sport-plus-2-xbri",
    images: ["/product-images/xbri/sport-plus-2/1.jpg"],
  },

  // Segunda rodada de coleta: pedido explícito do cliente para buscar fotos
  // em qualquer loja que venda o produto, não só no site oficial do
  // fabricante ("pode pegar de outro site que venda pneus também não tem
  // problema") — usada pra cobrir os modelos que ficaram sem foto na
  // primeira rodada (moto, van, caminhão/ônibus, agrícola e os Firestone
  // que bloqueiam acesso automatizado direto). Mesma base legal: cliente
  // declarou ser revendedor autorizado das marcas do catálogo.
  {
    brandName: "Pirelli",
    tireModelSlug: "city-dragon",
    sourceUrl: "https://www.pneus.org/pneu-90-90-18-pirelli-city-dragon",
    images: [
      "/product-images/pirelli/city-dragon/1.webp",
      "/product-images/pirelli/city-dragon/2.webp",
    ],
  },
  {
    brandName: "Pirelli",
    tireModelSlug: "mt65",
    sourceUrl: "https://www.vivemosmoto.com.br/pneu-100/90-18-pirelli-mt65-traseiro",
    images: [
      "/product-images/pirelli/mt65/1.png",
      "/product-images/pirelli/mt65/2.png",
      "/product-images/pirelli/mt65/3.png",
    ],
  },
  {
    brandName: "Michelin",
    tireModelSlug: "pilot-street-2",
    sourceUrl:
      "https://www.paulinhomotos.com.br/produto/pneu-michelin-pilot-street-2-90-90-18-57s-tt-tl-traseiro-cg-titan-125-ybr-125-hunter-max-yes-80115",
    images: ["/product-images/michelin/pilot-street-2/1.jpg"],
  },
  {
    brandName: "Xbri",
    tireModelSlug: "forza-van-f1",
    sourceUrl: "https://xbri.com.br/modelos/forza-van-f1",
    images: ["/product-images/xbri/forza-van-f1/1.png"],
  },
  {
    brandName: "Xbri",
    tireModelSlug: "cargoplus",
    sourceUrl: "https://xbri.com.br/modelos/cargoplus-g1",
    images: ["/product-images/xbri/cargoplus/1.png"],
  },
  {
    brandName: "Bridgestone",
    tireModelSlug: "r268",
    sourceUrl: "https://rodavivapneus.com/loja/pneu-295-80r22-5-r268-bridgestone/",
    images: ["/product-images/bridgestone/r268/1.jpg"],
  },
  {
    brandName: "Michelin",
    tireModelSlug: "x-multi-z",
    sourceUrl: "https://pro.michelin.com.br/pneus/michelin-x-multi-z2-22-5",
    images: [
      "/product-images/michelin/x-multi-z/1.png",
      "/product-images/michelin/x-multi-z/2.png",
      "/product-images/michelin/x-multi-z/3.png",
    ],
  },
  {
    brandName: "Firestone",
    tireModelSlug: "fs403-classic",
    sourceUrl: "https://www.dellavia.com.br/pneu-firestone-275-80r22-5-16l-fs403-classic-285016/p",
    images: [
      "/product-images/firestone/fs403-classic/1.jpg",
      "/product-images/firestone/fs403-classic/2.jpg",
    ],
  },
  {
    brandName: "Firestone",
    tireModelSlug: "f-600",
    sourceUrl: "https://www.atacadaopneus.com.br/pneu-aro-14-firestone-175-70r14-84t-f-600-p2936",
    images: [
      "/product-images/firestone/f-600/1.jpg",
      "/product-images/firestone/f-600/2.jpg",
      "/product-images/firestone/f-600/3.jpg",
    ],
  },
  {
    brandName: "Levorin",
    tireModelSlug: "matrix",
    sourceUrl: "https://www.fhmotos.com.br/pneu-tras-titan-levorin-matrix-90-90-18-57p",
    images: ["/product-images/levorin/matrix/1.jpg"],
  },
  {
    brandName: "Levorin",
    tireModelSlug: "duna-ii",
    sourceUrl:
      "https://www.paulinhomotos.com.br/produto/pneu-levorin-duna-ii-90-90-21-54s-tl-dianteiro-falcon-tornado-xre-300-lander-250-79853",
    images: ["/product-images/levorin/duna-ii/1.jpg"],
  },
  {
    brandName: "Rinaldi",
    tireModelSlug: "hb37",
    sourceUrl: "https://www.pneus.org/pneu-80-100-18-rinaldi-hb-37",
    images: [
      "/product-images/rinaldi/hb37/1.webp",
      "/product-images/rinaldi/hb37/2.jpg",
    ],
  },
  {
    brandName: "Continental",
    tireModelSlug: "hdc1",
    sourceUrl: "https://www.dcpneus.com.br/pneus/pneu-27580-r-22-5-borr-misto-continental-hdc1-16pr",
    images: [
      "/product-images/continental/hdc1/1.png",
      "/product-images/continental/hdc1/2.jpg",
    ],
  },
  {
    brandName: "Continental",
    tireModelSlug: "htr1",
    sourceUrl: "https://www.dcpneus.com.br/pneus/pneu-29580-r-22-5-liso-continental-htr1-16pr",
    images: [
      "/product-images/continental/htr1/1.jpg",
      "/product-images/continental/htr1/2.png",
    ],
  },
  {
    brandName: "Pirelli",
    tireModelSlug: "php-70",
    sourceUrl: "https://www.bellenzier.com.br/pneu-710-70r38-php-70-r-1w-171d-tl-aro-38-agricola-pirelli.html",
    images: ["/product-images/pirelli/php-70/1.webp"],
  },

  // Terceira rodada: entrada da marca Westlake no catálogo (11ª marca,
  // ver top-brands.ts). Fotos coletadas do site oficial da marca no Brasil.
  {
    brandName: "Westlake",
    tireModelSlug: "rp28",
    sourceUrl: "https://www.westlakepneus.com.br/pt/index.php/productcars/info/PassengerCars/9",
    images: ["/product-images/westlake/rp28/1.png"],
  },
  {
    brandName: "Westlake",
    tireModelSlug: "su318",
    sourceUrl: "https://www.westlakepneus.com.br/pt/index.php/productcars/info/PassengerCars/su318/411",
    images: ["/product-images/westlake/su318/1.png"],
  },
];
