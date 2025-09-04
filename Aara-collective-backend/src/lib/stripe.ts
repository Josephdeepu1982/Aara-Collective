import Stripe from "stripe";

let stripe: Stripe | null = null;

export const getStripe = () => {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
    stripe = new Stripe(secretKey, {
    });
  }
  return stripe;
};