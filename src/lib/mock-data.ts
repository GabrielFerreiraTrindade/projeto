import type { FaqItem, ProductCategory, Review } from "@/types/catalog";

// Dados fictícios usados apenas para visualizar o layout nesta etapa.
// Nenhum destes dados vem do banco — a integração real acontece depois.

export const categories: { label: string; value: ProductCategory }[] = [
  { label: "Pneus de carro", value: "carro" },
  { label: "Pneus de SUV e caminhonete", value: "suv-caminhonete" },
  { label: "Pneus de moto", value: "moto" },
];

// Faixas padrão de mercado (largura/perfil/aro), para o buscador por medida
// aceitar qualquer combinação real — não se limita às medidas hoje
// disponíveis no catálogo (a busca simplesmente retorna "nenhum produto
// encontrado" para combinações sem estoque, como qualquer loja real).
export const tireWidths = [
  "125", "135", "145", "155", "165", "175", "185", "195",
  "205", "215", "225", "235", "245", "255", "265", "275",
  "285", "295", "305", "315", "325", "335",
];
export const tireAspectRatios = [
  "25", "30", "35", "40", "45", "50", "55", "60",
  "65", "70", "75", "80", "82", "85",
];
export const tireRimDiameters = [
  "12", "13", "14", "15", "16", "17", "18", "19",
  "20", "21", "22", "23", "24",
];

export const reviews: Review[] = [
  {
    id: "1",
    author: "Carla M.",
    rating: 5,
    comment:
      "Comprei para o meu carro e a entrega chegou antes do prazo. Pneu de ótima qualidade.",
    productName: "Pneu Michelin Primacy 4 185/65 R15",
    date: "2026-06-12",
  },
  {
    id: "2",
    author: "Rodrigo A.",
    rating: 5,
    comment:
      "Preço justo e o site facilitou muito encontrar a medida certa para minha caminhonete.",
    productName: "Pneu Goodyear Assurance 225/65 R17",
    date: "2026-07-03",
  },
  {
    id: "3",
    author: "Fernanda S.",
    rating: 4,
    comment: "Bom custo-benefício. Recomendo para quem procura pneu de SUV.",
    productName: "Pneu Bridgestone Turanza 185/65 R15",
    date: "2026-07-21",
  },
  {
    id: "4",
    author: "Marcos P.",
    rating: 5,
    comment: "Segunda vez que compro. Atendimento rápido e pneu original.",
    productName: "Pneu Firestone F-600 175/70 R14",
    date: "2026-08-02",
  },
];

export const storeBenefits = [
  {
    title: "Compra segura",
    description: "Ambiente protegido do início ao fim da compra.",
  },
  {
    title: "Pagamento seguro",
    description: "Cartão, Pix ou boleto, com dados sempre protegidos.",
  },
  {
    title: "Entrega para toda Minas Gerais",
    description: "Cobrimos a capital e o interior do estado.",
  },
  {
    title: "Garantia de fábrica",
    description: "Todos os pneus com garantia direto do fabricante.",
  },
  {
    title: "Atendimento especializado",
    description: "Equipe pronta para ajudar a escolher o pneu certo.",
  },
];

export const paymentMethods = ["Cartão de crédito", "Pix", "Boleto bancário"];

export const deliveryInfo = {
  title: "Entrega rápida em Minas Gerais",
  description:
    "Calcule o prazo de entrega para a sua cidade informando o CEP na página do produto.",
};

export const faqItems: FaqItem[] = [
  {
    id: "1",
    question: "Como sei a medida correta do pneu do meu veículo?",
    answer:
      "A medida fica escrita na lateral do pneu atual (ex: 185/65 R15) ou no manual do veículo. Você também pode usar a busca por veículo informando marca, modelo, ano e versão.",
  },
  {
    id: "2",
    question: "Para quais cidades vocês entregam?",
    answer:
      "Entregamos para toda a capital e o interior de Minas Gerais. O prazo varia de acordo com a cidade de destino.",
  },
  {
    id: "3",
    question: "Posso parcelar a compra?",
    answer:
      "Sim, o parcelamento no cartão de crédito é exibido diretamente no card de cada produto, sem juros dependendo do valor.",
  },
  {
    id: "4",
    question: "Os pneus têm garantia?",
    answer:
      "Sim, todos os produtos contam com garantia de fábrica contra defeitos de fabricação.",
  },
  {
    id: "5",
    question: "Como funciona a troca ou devolução?",
    answer:
      "Você pode solicitar troca ou devolução em até 7 dias após o recebimento, desde que o produto não tenha sido rodado.",
  },
];
