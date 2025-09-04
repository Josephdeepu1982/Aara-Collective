import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { corsMiddleware } from "./middleware/cors.js";
import apiRateLimit from "./middleware/rateLimit.js";
import { notFound, generalErrorHandler } from "./middleware/error.js";
import apiRouter from "./routes/index.js";
import clerkWebhook from "./routes/clerkWebhook.js";
import { checkoutRouter, checkoutWebhook } from "./routes/checkout.js";
import { clerkMiddleware } from "@clerk/express";

const app = express();

function requireEnv(key: string) {
  if (!process.env[key]) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing required env: ${key}`);
    } else {
      console.warn(`${key} not set (dev only)`);
    }
  }
}

requireEnv("CLERK_PUBLISHABLE_KEY");
requireEnv("CLERK_SECRET_KEY");

const isDev = process.env.NODE_ENV !== "production";

const cspDirectives = {
  ...helmet.contentSecurityPolicy.getDefaultDirectives(),
  "img-src": [
    "'self'",
    "data:",
    "https://*.amazonaws.com",
    "https://*.cloudfront.net",
  ],
  "script-src": ["'self'", "https://js.stripe.com"],
  "frame-src": ["https://js.stripe.com"],
  "connect-src": [
    "'self'",
    process.env.CORS_ORIGIN ?? "*",
    "https://api.stripe.com",
    ...(process.env.NODE_ENV !== "production"
      ? ["ws:", "http://localhost:5173"]
      : []),
  ],
} as const;

app.use(
  helmet({
    contentSecurityPolicy: { useDefaults: false, directives: cspDirectives },
  })
);
app.use(corsMiddleware);

app.use(
  clerkMiddleware({ publishableKey: process.env.CLERK_PUBLISHABLE_KEY! })
);

app.use("/api/webhooks", clerkWebhook);
app.post(
  "/checkout/webhook",
  express.raw({ type: "application/json" }),
  checkoutWebhook
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(apiRateLimit);

app.get("/healthz", (req, res) => res.json({ ok: true }));
app.get("/", (_req, res) => res.send("Aara backend is running"));

app.use("/", apiRouter);
app.use("/checkout", checkoutRouter);

app.use(notFound);
app.use(generalErrorHandler);

export default app;
