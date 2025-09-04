//This code handles pricing and order creation in your e-commerce backend. It:
// 1. Calculates the total price of items in the cart.
// 2. Applies any valid coupon discount.
// 3. Adds shipping if needed.
// 4. Creates an order in the database with all this info.

import prisma from "../dao/prisma.js";
import { createOrderTx } from "../dao/order.dao.js";
import { findActiveCoupon } from "../dao/coupon.dao.js";
import type { CreateOrderInput } from "../dto/orders.dto.js";

//Function to calculate the total price of the cart, including discounts and shipping -> Gets product prices from the database > Calculates subtotal by multiplying price × quantity for each item > Checks for a coupon and applies either a percentage or fixed discount > Adds shipping > Returns final pricing:
const priceCart = async (
  cartItems: CreateOrderInput["items"],
  enteredCouponCode?: string //optional string "SUMMER10" or undefined if no code was entered.
) => {
  //step1: get product details from database
  //prisma.product.findMany(...): Fetches multiple products from the database.
  //where: { id: { in: [...] } }: Filters products whose IDs match those in the cart.
  //cartItems.map(...): Extracts all productIds from the cart.
  // select: { ... }: Only fetches the fields needed for pricing — id, basePriceCents, and salePriceCents.
  const allProducts = await prisma.product.findMany({
    where: {
      id: {
        in: cartItems.map((singleItem) => {
          return singleItem.productId;
        }),
      },
    },
    select: {
      id: true,
      basePriceCents: true,
      salePriceCents: true,
    },
  });

  //Step2: create a map of product ID to its price (sale price if available, otherwise base price)
  //new Map([...]): Creates a key-value lookup table.
  //returns Map { "prod_123" => 1999,"prod_456" => 1499,..}

  const productPriceMap = new Map(
    allProducts.map((singleProduct) => {
      const finalPrice =
        singleProduct.salePriceCents ?? singleProduct.basePriceCents;
      return [singleProduct.id, finalPrice];
    })
  );

  //Step3: Calculate subtotal by multiplying price × quantity for each item
  //pricePerUnit: Gets the price for one product from the map.
  //subtotal is the sum of all item prices × quantities.
  let subtotalCents = 0;
  for (const singleCartItem of cartItems) {
    const pricePerUnit = productPriceMap.get(singleCartItem.productId);
    if (pricePerUnit == null) {
      const error = new Error("Product not found");
      throw Object.assign(error, { status: 400 });
    }
    subtotalCents += pricePerUnit * singleCartItem.quantity;
  }

  //Step4: Apply Coupon discount if a code was entered
  let discountCents = 0;
  if (enteredCouponCode) {
    const code = enteredCouponCode.toUpperCase(); // 🔧 CHANGE
    const found = await findActiveCoupon(code);
    if (!found)
      throw Object.assign(new Error("invalid coupon"), { status: 400 });
    if (found.percentOff)
      discountCents = Math.floor(subtotalCents * (found.percentOff / 100));
    if (found.amountOffCents)
      discountCents = Math.max(discountCents, found.amountOffCents);
  }

  // Step 5: Add shipping cost (free if total after discount is over 5000 cents)
  const shippingCents = subtotalCents - discountCents > 5000 ? 0 : 1500;

  // Step 6: Calculate final total
  const totalCents = subtotalCents - discountCents + shippingCents;

  // Step 7: Return all pricing details
  return { subtotalCents, discountCents, shippingCents, totalCents };
};

// This function creates the order in the database using the pricing info
const createOrder = async (orderInput: CreateOrderInput) => {
  //calls priceCart() with the cart items and coupon code and calculates the full pricing before creating the order.
  const calculatedPricing = await priceCart(
    orderInput.items,
    orderInput.couponCode
  );
  const createdOrder = await createOrderTx(orderInput, calculatedPricing); //Calls a DAO function to create the order in the database. Passes both the user’s input (shipping, address..etc) and the calculated pricing.

  return {
    //Returns the final order summary to the frontend.
    // Includes the order ID and all pricing details.
    // This is what your frontend can show on the order confirmation page.
    orderId: createdOrder.id,
    subtotalCents: calculatedPricing.subtotalCents,
    discountCents: calculatedPricing.discountCents,
    shippingCents: calculatedPricing.shippingCents,
    totalCents: calculatedPricing.totalCents,
  };
};

export default createOrder;
