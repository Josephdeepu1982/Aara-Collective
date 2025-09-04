import { Router } from "express";
import handlePostOrder from "../controllers/orders.controller.js";

const router = Router();

router.post("/", handlePostOrder);

export default router;
