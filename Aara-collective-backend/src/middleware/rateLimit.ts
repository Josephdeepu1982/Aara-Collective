//helps limit how often someone can hit our API.

import rateLimit from "express-rate-limit";

// this rule states that In every 60,000 milliseconds (aka 1 minute),A single user (based on IP address) can make up to 120 requests.
const apiRateLimit = rateLimit({
  windowMs: 60_000,
  max: 120,
});

export default apiRateLimit;
