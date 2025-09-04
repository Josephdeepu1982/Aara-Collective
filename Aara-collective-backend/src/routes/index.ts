import { Router } from "express";
import productsRoutes from "../routes/products.routes.js";
import ordersRoutes from "../routes/orders.routes.js";
import couponsRoutes from "../routes/coupons.routes.js";

const router = Router();

// Use the product routes for any path starting with "/products"
router.use("/products", productsRoutes);
// Use the order routes for any path starting with "/orders"
router.use("/order", ordersRoutes);
// Use the coupon routes for any path starting with "/coupons"
router.use("coupons", couponsRoutes);

export default router;
