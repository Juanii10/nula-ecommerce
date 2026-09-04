import { Router } from "express";
import { listCategories, createCategory } from "../controllers/categories.controller.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = Router();

router.get("/", listCategories);
router.post("/", requireAuth, requireAdmin, createCategory);

export default router;
