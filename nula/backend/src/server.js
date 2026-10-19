import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import productsRoutes from "./routes/products.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import { prisma } from "./lib/prisma.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

// /api/health?db=1 además despierta la base (Neon) con un SELECT 1; lo usa el keep-alive
app.get("/api/health", async (req, res) => {
  if (req.query.db) {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      return res.status(503).json({ ok: false, db: false });
    }
  }
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/orders", ordersRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`NULA API corriendo en http://localhost:${PORT}`);
});
