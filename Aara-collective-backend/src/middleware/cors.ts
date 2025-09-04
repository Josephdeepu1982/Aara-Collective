import cors from "cors";
import { env } from "../config/env.js";

//creating a middleware function that: Allows requests only from the origin you specify (your frontend) & Allows cookies or login tokens to be sent along with those requests (credentials: true).
const allowlist = [
  env.CORS_ORIGIN, // e.g. https://aaracollective.com
  "https://*.vercel.app",
  "https://*.netlify.app",
];

const matches = (origin: string, pattern: string) => {
  if (pattern.includes("*")) {
    const re = new RegExp(
      "^" +
        pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\*/g, ".*") +
        "$",
      "i"
    );
    return re.test(origin);
  }
  return origin === pattern;
};

export const corsMiddleware = cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    const ok = allowlist.some((p) => matches(origin, p));
    cb(ok ? null : new Error("Not allowed by CORS"), ok);
  },
  credentials: true,
});

//This Middlware protects your backend from random websites trying to access it.
// Enables secure communication between your frontend and backend—especially important for login, cart, and checkout flows.
// Supports cookies or session tokens, which are essential for authenticated users.
