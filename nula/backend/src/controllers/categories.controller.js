import { prisma } from "../lib/prisma.js";

export async function listCategories(req, res) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  res.json(categories);
}

export async function createCategory(req, res) {
  const { name, slug } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ error: "Faltan nombre o slug" });
  }
  const category = await prisma.category.create({ data: { name, slug } });
  res.status(201).json(category);
}
