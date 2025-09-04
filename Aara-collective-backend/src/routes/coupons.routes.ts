import { Router } from "express";
import rateLimit from "express-rate-limit";
import getCoupon from "../controllers/coupons.controller.js";

const router = Router();

const couponLimiter = rateLimit({ windowMs: 60_000, max: 30 });

router.get("/:code", couponLimiter, getCoupon);

export default router;
