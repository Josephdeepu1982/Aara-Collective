import prisma from "./prisma.js";
import type { CreateOrderInput } from "../dto/orders.dto.js";

export const createOrderTx = async (
  input: CreateOrderInput,
  pricing: {
    subtotalCents: number;
    discountCents: number;
    shippingCents: number;
    totalCents: number;
  }
) => {
  return prisma.$transaction(async (tx) => {
    const address = await tx.address.create({
      data: {
        fullName: input.shipping.fullName,
        email: input.shipping.email,
        phone: input.shipping.phone ?? "",
        address: input.shipping.address,
        city: input.shipping.city,
        country: input.shipping.country,
        postalCode: input.shipping.postalCode,
      },
    });

    const itemsToCreate = await Promise.all(
      input.items.map(async (it) => {
        const product = await tx.product.findUniqueOrThrow({
          where: { id: it.productId },
        });

        let unit = product.salePriceCents ?? product.basePriceCents;

        if (it.variantId) {
          const variant = await tx.productVariant.findUnique({
            where: { id: it.variantId },
          });
          if (!variant) {
            throw Object.assign(new Error("Variant not found"), {
              status: 400,
            });
          }
          if (variant.productId !== product.id) {
            throw Object.assign(
              new Error("Variant does not belong to product"),
              {
                status: 400,
              }
            );
          }

          if (variant.stock < it.quantity) {
            throw Object.assign(new Error("Insufficient stock"), {
              status: 400,
            });
          }

          if (typeof variant.priceCents === "number") {
            unit = variant.priceCents;
          }

          await tx.productVariant.update({
            where: { id: it.variantId },
            data: { stock: { decrement: it.quantity } },
          });
        }

        return {
          productId: it.productId,
          variantId: it.variantId ?? null,
          quantity: it.quantity,
          unitPriceCents: unit,
          lineTotalCents: unit * it.quantity,
        };
      })
    );

    const order = await tx.order.create({
      data: {
        shippingAddressId: address.id,
        subtotalCents: pricing.subtotalCents,
        discountCents: pricing.discountCents,
        shippingCents: pricing.shippingCents,
        totalCents: pricing.totalCents,
        couponCode: input.couponCode ?? null,
        notes: input.notes ?? null,
        items: { create: itemsToCreate },
      },
    });

    return order;
  });
};
