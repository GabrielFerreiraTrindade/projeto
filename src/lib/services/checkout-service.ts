import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payment/payment-provider";
import type { CreatePaymentInput } from "@/lib/payment/payment-types";
import {
  createOrder,
  createPaymentRecord,
  type CreateOrderLine,
} from "@/lib/services/order-service";
import type { OrderWithRelations } from "@/types/order";

// Orquestra o checkout: recalcula preços a partir do banco (nunca confia no
// valor que o cliente mandou), cria o pedido e chama o gateway de
// pagamento configurado através da abstração PaymentProvider.

export const PIX_EXPIRATION_SECONDS = 30 * 60; // 30 minutos

export class OutOfStockError extends Error {
  constructor(public readonly productSlug: string) {
    super(`"${productSlug}" está sem estoque suficiente no momento.`);
    this.name = "OutOfStockError";
  }
}

export type CheckoutCartLine = { productId: string; quantity: number };

export type CheckoutCustomer = {
  name: string;
  document: string;
  email: string;
  phoneAreaCode: string;
  phoneNumber: string;
};

export type CheckoutShipping = {
  method: string;
  carrier: string;
  price: number;
};

export type CheckoutPaymentChoice =
  | { method: "PIX" }
  | { method: "CREDIT_CARD"; cardToken: string; installments: number };

export type SubmitCheckoutInput = {
  userId: string;
  addressId: string;
  lines: CheckoutCartLine[];
  customer: CheckoutCustomer;
  shipping: CheckoutShipping;
  payment: CheckoutPaymentChoice;
  /** IP do cliente — exigido pelo PayOnPag, repassado direto pra CreatePaymentInput. */
  customerIp?: string;
};

export type SubmitCheckoutResult = {
  order: OrderWithRelations;
};

async function resolvePricedLines(
  lines: CheckoutCartLine[],
): Promise<{ priced: (CreateOrderLine & { name: string; slug: string })[]; subtotal: number; discount: number }> {
  const productIds = lines.map((line) => line.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { stock: true },
  });

  const priced: (CreateOrderLine & { name: string; slug: string })[] = [];
  let subtotal = 0;
  let discount = 0;

  for (const line of lines) {
    const product = products.find((item) => item.id === line.productId);
    if (!product || !product.isActive) {
      throw new OutOfStockError(line.productId);
    }
    if (!product.stock || product.stock.quantity < line.quantity) {
      throw new OutOfStockError(product.slug);
    }

    const unitPrice = Number(product.price);
    const compareAtPrice = product.compareAtPrice
      ? Number(product.compareAtPrice)
      : unitPrice;

    subtotal += compareAtPrice * line.quantity;
    discount += (compareAtPrice - unitPrice) * line.quantity;

    priced.push({
      productId: product.id,
      quantity: line.quantity,
      unitPrice,
      name: product.name,
      slug: product.slug,
    });
  }

  return { priced, subtotal, discount };
}

export async function submitCheckout(
  input: SubmitCheckoutInput,
): Promise<SubmitCheckoutResult> {
  const { priced, subtotal, discount } = await resolvePricedLines(input.lines);
  const total = subtotal - discount + input.shipping.price;

  const order = await createOrder({
    userId: input.userId,
    addressId: input.addressId,
    lines: priced,
    subtotal,
    discount,
    shippingCost: input.shipping.price,
    total,
    shippingMethod: input.shipping.method,
    shippingCarrier: input.shipping.carrier,
  });

  const provider = await getPaymentProvider();
  const amountInCents = Math.round(total * 100);

  const paymentInput: CreatePaymentInput = {
    orderId: order.id,
    amountInCents,
    customerIp: input.customerIp,
    customer: {
      name: input.customer.name,
      email: input.customer.email,
      document: input.customer.document.replace(/\D/g, ""),
      phone: {
        areaCode: input.customer.phoneAreaCode,
        number: input.customer.phoneNumber,
      },
    },
    items: priced.map((line) => ({
      description: line.name,
      quantity: line.quantity,
      amountInCents: Math.round(line.unitPrice * 100),
    })),
    payment:
      input.payment.method === "PIX"
        ? { method: "PIX", expiresInSeconds: PIX_EXPIRATION_SECONDS }
        : {
            method: "CREDIT_CARD",
            cardToken: input.payment.cardToken,
            installments: input.payment.installments,
          },
  };

  const result = await provider.createPayment(paymentInput);

  await createPaymentRecord({
    orderId: order.id,
    method: input.payment.method,
    amount: total,
    gateway: provider.name,
    externalId: result.externalId,
    status: result.status,
    cardBrand: result.card?.brand,
    cardLastFour: result.card?.lastFourDigits,
    installments: result.card?.installments,
    pixQrCode: result.pix?.qrCode,
    pixQrCodeUrl: result.pix?.qrCodeUrl,
    pixExpiresAt: result.pix ? new Date(result.pix.expiresAt) : undefined,
  });

  const orderWithPayment = await prisma.order.findUniqueOrThrow({
    where: { id: order.id },
    include: {
      address: true,
      items: { include: { product: true } },
      payment: true,
      shipment: true,
    },
  });

  return { order: orderWithPayment };
}
