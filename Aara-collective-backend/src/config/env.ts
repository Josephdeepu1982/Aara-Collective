import "dotenv/config";
//automatically loads environment variables from a .env file into process.env.

export const env = {
  NODE_ENV: process.env.NODE_ENV ? process.env.NODE_ENV : "development", //Uses the value from .env if available. Falls back to "development" if not set.

  PORT: process.env.PORT ? Number(process.env.PORT) : 4000, //Port number your server listens on. Ensures the port is a number. Defaults to 4000 if not specified.

  CORS_ORIGIN: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN
    : "http://localhost:5173",
  //Sets the allowed origin for frontend requests. CORS is like a bouncer at a club. It checks where the request is coming from and decides whether to let it in. You control the guest list via headers. This tells your server to accept requests from your frontend during development—or from your production domain later.
};

