import { Router } from "express";
import {
  checkout,
  listMyOrders,
  getOrderById,
  listAllOrders,
  updateOrderStatus,
} from "../controllers/orders.controller.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = Router();

router.post("/checkout", requireAuth, checkout);
router.get("/mine", requireAuth, listMyOrders);
router.get("/all", requireAuth, requireAdmin, listAllOrders);
router.get("/:id", requireAuth, getOrderById);
router.patch("/:id/status", requireAuth, requireAdmin, updateOrderStatus);

export default router;
