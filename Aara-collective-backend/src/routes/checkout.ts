import express from "express";
import type Stripe from "stripe";
import rateLimit from "express-rate-limit";
import { getStripe } from "../lib/stripe.js";
import prisma from "../dao/prisma.js";

export const checkoutRouter = express.Router();
const createIntentLimiter = rateLimit({ windowMs: 60_000, max: 10 });

type CreateIntentBody = {
  email: string;
  name: string;
  items: { productId: string; quantity: number; variantId?: string }[];
  shipping: {
    fullName: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
  };
  couponCode?: string;
  notes?: string;
};

const resolveUnitPriceCents = (args: {
  product: {
    basePriceCents: number;
    salePriceCents: number | null;
    isSale: boolean;
  };
  variant: { priceCents: number | null } | null;
}) => {
  const variantPrice = args.variant?.priceCents ?? null;
  if (typeof variantPrice === "number") return variantPrice;
  if (args.product.isSale && typeof args.product.salePriceCents === "number") {
    return args.product.salePriceCents;
  }
  return args.product.basePriceCents;
};

const computeShippingCents = (subtotalCents: number) =>
  subtotalCents > 5000 ? 0 : 1500;

checkoutRouter.post("/create-intent", createIntentLimiter, async (req, res) => {
  try {
    const body = req.body as CreateIntentBody;
    if (
      !body?.email ||
      !body?.name ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const productIds = Array.from(new Set(body.items.map((i) => i.productId)));
    const variantIds = Array.from(
      new Set(body.items.map((i) => i.variantId).filter(Boolean))
    ) as string[];

    const upper = body.couponCode ? body.couponCode.toUpperCase() : undefined;

    const [products, variants, coupon] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          basePriceCents: true,
          salePriceCents: true,
          isSale: true,
        },
      }),
      prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        select: { id: true, priceCents: true },
      }),
      upper
        ? prisma.coupon.findUnique({ where: { code: upper } })
        : Promise.resolve(null),
    ]);

    const productById = new Map(products.map((p) => [p.id, p]));
    const variantById = new Map(variants.map((v) => [v.id, v]));

    const lineItems = body.items.map((i) => {
      const product = productById.get(i.productId);
      if (!product) throw new Error(`Product not found: ${i.productId}`);
      const variant = i.variantId ? variantById.get(i.variantId) ?? null : null;
      const unitPriceCents = resolveUnitPriceCents({ product, variant });
      const qty = Math.max(1, i.quantity);
      const lineTotalCents = unitPriceCents * qty;
      return {
        productId: i.productId,
        variantId: i.variantId ?? null,
        quantity: qty,
        unitPriceCents,
        lineTotalCents,
      };
    });

    const subtotalCents = lineItems.reduce(
      (sum, li) => sum + li.lineTotalCents,
      0
    );

    let discountCents = 0;
    if (coupon?.active) {
      if (typeof coupon.percentOff === "number") {
        discountCents = Math.floor((subtotalCents * coupon.percentOff) / 100);
      } else if (typeof coupon.amountOffCents === "number") {
        discountCents = Math.min(subtotalCents, coupon.amountOffCents);
      }
    }

    const shippingCents = computeShippingCents(subtotalCents);
    const totalCents = Math.max(
      0,
      subtotalCents - discountCents + shippingCents
    );

    const customer = await prisma.customer.upsert({
      where: { email: body.email },
      update: { name: body.name },
      create: { email: body.email, name: body.name },
      select: { id: true },
    });

    const address = await prisma.address.create({
      data: {
        fullName: body.shipping.fullName,
        email: body.shipping.email,
        phone: body.shipping.phone ?? null,
        address: body.shipping.address,
        city: body.shipping.city,
        country: body.shipping.country,
        postalCode: body.shipping.postalCode,
      },
      select: { id: true },
    });

    const order = await prisma.order.create({
      data: {
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotalCents,
        discountCents,
        shippingCents,
        totalCents,
        couponCode: upper ?? null,
        notes: body.notes ?? null,
        customer: { connect: { id: customer.id } },
        shippingAddress: { connect: { id: address.id } },
        items: {
          create: lineItems.map((li) => {
            const base = {
              quantity: li.quantity,
              unitPriceCents: li.unitPriceCents,
              lineTotalCents: li.lineTotalCents,
              product: { connect: { id: li.productId } },
            } as const;
            return li.variantId
              ? { ...base, variant: { connect: { id: li.variantId } } }
              : base;
          }),
        },
      },
      select: { id: true, totalCents: true },
    });

    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create(
      {
        amount: order.totalCents,
        currency: "sgd",
        automatic_payment_methods: { enabled: true },
        description: `Aara Collective Order ${order.id}`,
        metadata: { orderId: order.id, email: body.email },
      },
      { idempotencyKey: `pi_${order.id}` }
    );

    return res.json({
      clientSecret: intent.client_secret,
      orderId: order.id,
      totals: { subtotalCents, discountCents, shippingCents, totalCents },
    });
  } catch (err) {
    console.error("create-intent error:", err);
    return res.status(500).json({ error: "Failed to create payment intent" });
  }
});

export const checkoutWebhook = async (
  req: express.Request,
  res: express.Response
) => {
  const stripe = getStripe();
  const signature = req.headers["stripe-signature"] as string;
  try {
    const event = stripe.webhooks.constructEvent(
      (req as any).body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );

    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "PAID", paymentStatus: "SUCCEEDED" },
        });
        console.log("Order paid:", orderId);
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "FAILED" },
        });
        console.warn("Order failed:", orderId);
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("Webhook verification failed:", (err as Error).message);
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }
};
