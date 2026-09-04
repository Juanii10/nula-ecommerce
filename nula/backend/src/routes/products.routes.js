import { Router } from "express";
import {
  listProducts,
  getFeatured,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  updateVariantStock,
} from "../controllers/products.controller.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = Router();

router.get("/featured", getFeatured);
router.get("/:slug", getProductBySlug);
router.get("/", listProducts);

router.post("/", requireAuth, requireAdmin, createProduct);
router.put("/:id", requireAuth, requireAdmin, updateProduct);
router.delete("/:id", requireAuth, requireAdmin, deleteProduct);
router.patch("/variants/:variantId/stock", requireAuth, requireAdmin, updateVariantStock);

export default router;
