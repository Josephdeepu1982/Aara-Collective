import { Router } from "express";
import productsRoutes from "../routes/products.routes.js";
import ordersRoutes from "../routes/orders.routes.js";
import couponsRoutes from "../routes/coupons.routes.js";
import categoriesRoutes from "./categories.routes.js";
import { getAuth } from "@clerk/express";

const router = Router();

// Use the product routes for any path starting with "/products"
router.use("/products", productsRoutes);
// Use the order routes for any path starting with "/orders"
router.use("/orders", ordersRoutes);
// Use the coupon routes for any path starting with "/coupons"
router.use("/coupons", couponsRoutes);
router.use("/categories", categoriesRoutes);

export default router;
