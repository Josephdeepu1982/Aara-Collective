import { Router } from "express";
import productsController from "../controllers/products.controller.js";
import validate from "../middleware/validate.js";
import { createProductSchema, productQuerySchema } from "../dto/products.dto.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", productsController.getProducts);
router.get("/featured", productsController.getFeatured);
router.get("/:id", productsController.getProductUsingId);

//admin only
router.post("/", requireAdmin,  productsController.handleCreateProduct);
router.delete("/:id", requireAdmin, productsController.handleDeleteProduct);

export default router;
