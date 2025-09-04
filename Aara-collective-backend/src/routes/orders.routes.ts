import { Router } from "express";
import { handlePostOrder } from "../controllers/orders.controller.js";
import { handleGetOrders } from "../controllers/orders.controller.js";
import { handleGetOrderById } from "../controllers/orders.controller.js";
import { handleDeleteOrder } from "../controllers/orders.controller.js";
import { handleUpdateOrder } from "../controllers/orders.controller.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/", handlePostOrder);
router.get("/", requireAdmin, handleGetOrders);
router.get("/:id", requireAdmin, handleGetOrderById);
router.patch("/:id", requireAdmin, handleUpdateOrder);
router.delete("/:id", requireAdmin, handleDeleteOrder);

export default router;
