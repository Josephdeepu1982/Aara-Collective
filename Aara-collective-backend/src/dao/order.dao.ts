//checkout engine of backend -> it creates an order, saves the shipping address, calculates pricing, and updates inventory—all inside a safe transaction.

import prisma from "./prisma.js"; //used to read/write data.
import type { CreateOrderInput } from "../dto/orders.dto.js"; //The Zod schema CreateOrderInput is used to validate incoming data (e.g. from a REST or GraphQL endpoint). Once validated, the resulting object conforms to the TypeScript type CreateOrderInput, which is passed into this function.

//creates order. two inputs: input: The user’s order details (shipping, items, coupon, etc.) & pricing: Pre-calculated pricing values in cents
//pricing is pre-calculated before calling createOrderTx in controller or service layer.
export const createOrderTx = async (
  input: CreateOrderInput,
  pricing: {
    subtotalCents: number;
    discountCents: number;
    shippingCents: number;
    totalCents: number;
  }
) => {
  //Creates a shipping address from the user's input.
  //return prisma.$transaction(async (tx) => { Begins a database transaction using Prisma. All operations inside this block will either succeed together or fail together—no partial orders.
  //$transaction rolls back everything if a step fails
  //tx is the transactional Prisma client passed into the $transaction block.
  return prisma.$transaction(async (tx) => {
    const address = await tx.address.create({
      //create shipping address in database. uses data from input.shipping
      data: {
        fullName: input.shipping.fullName,
        email: input.shipping.email,
        phone: input.shipping.phone ?? "",
        line1: input.shipping.address,
        city: input.shipping.city,
        country: input.shipping.country,
        postalCode: input.shipping.postalCode,
      },
    });
    //Creates a new order  record & links it to the shipping record. Saves pricing and optional coupon/note info.
    // 1. Pricing details (subtotal, discount, shipping, total)
    // 2. Optional coupon code and notes
    // 3. A list of items, each mapped to: Its product and variant, Calculated unit price and line total & Optional stock decrement on variant
    //4. Returns the created order, including all nested items.
    const order = await tx.order.create({
      data: {
        shippingAddressId: address.id,
        subtotalCents: pricing.subtotalCents,
        discountCents: pricing.discountCents,
        shippingCents: pricing.shippingCents,
        totalCents: pricing.totalCents,
        couponCode: input.couponCode ?? null,
        notes: input.notes ?? null,
        //Create Order Items
        items: {
          create: await Promise.all(
            //Loops through each item in the cart.
            // Uses Promise.all to run item creation in parallel.
            input.items.map(async (it) => {
              //Fetch Product Info from db. throw error if product doesnt exist.
              //findUniqueOrThrow is a Prisma method that: Looks up a record by unique key (id). Throws an error if not found—useful for strict validation.
              const product = await tx.product.findUniqueOrThrow({
                where: { id: it.productId },
              });
              //calculate pricing: Uses the sale price if available, otherwise the base price. Calculates the total price for that item (unit × quantity).
              const unit = product.salePriceCents ?? product.basePriceCents;
              const line = unit * it.quantity;
              //Update Variant Stock. If the item has a variant (like size or color), reduce its stock.
              //"it" is each item in the cart, from input.items.map(...).
              if (it.variantId) {
                await tx.productVariant.update({
                  where: { id: it.variantId },
                  data: { stock: { decrement: it.quantity } },
                });
              }
              //Return Item Data to be saved in the order
              return {
                productId: it.productId,
                variantId: it.variantId ?? null,
                quantity: it.quantity,
                unitPriceCents: unit,
                lineTotalCents: line,
              };
            })
          ),
        },
      },
    });
    //Returns the full order object after everything is saved.
    return order;
  });
};
