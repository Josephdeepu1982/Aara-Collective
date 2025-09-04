import { Router } from "express";
import getCoupon from "../controllers/coupons.controller.js";

const router = Router();

router.get("/:code", getCoupon);

export default router;
