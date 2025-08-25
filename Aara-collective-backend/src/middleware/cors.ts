import cors from "cors";
import { env } from "../config/env.js";

//creating a middleware function that: Allows requests only from the origin you specify (your frontend) & Allows cookies or login tokens to be sent along with those requests (credentials: true).
export const corsMiddleware = cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
});

//This Middlware protects your backend from random websites trying to access it.
// Enables secure communication between your frontend and backend—especially important for login, cart, and checkout flows.
// Supports cookies or session tokens, which are essential for authenticated users.
