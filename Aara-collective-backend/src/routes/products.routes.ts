import { Router } from "express";
import {
  getFeaturedProducts,
  getProductById,
  listProducts,
} from "../services/products.service.js";

const router = Router();

router.get("/", listProducts);
router.get("/featured", getFeaturedProducts);
router.get("/:id", getProductById);

export default router;
