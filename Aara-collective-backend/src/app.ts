import express from "express";
import helmet from "helmet"; //Adds security headers to your HTTP responses.Helps protect against common web vulnerabilities like cross-site scripting (XSS), clickjacking, and sniffing attacks.
import morgan from "morgan"; //Logs incoming HTTP requests in a readable format
import pino from "pino-http"; //Logs requests and responses in JSON format
import { corsMiddleware } from "./middleware/cors.js"; //Controls which frontend domains are allowed to talk to your backend.
import apiRateLimit from "./middleware/rateLimit.js"; //Limits how many requests a user can make in a short time.
import { notFound, generalErrorHandler } from "./middleware/error.js"; //notFound: Handles requests to unknown routes (returns a 404).errorHandler: Catches and formats errors from your app (returns a 500 or custom error).
//import routes from "./routes"; //Imports all your defined API endpoints (like /products, /categories, /checkout)

const app = express();

app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: "1mb" }));
app.use(apiRateLimit);
app.use(morgan("dev"));
//app.use(pino());

app.get("/healthz", (req, res) => res.json({ ok: true }));

//app.use("/api", routes);

app.use(notFound);
app.use(generalErrorHandler);

export default app;
