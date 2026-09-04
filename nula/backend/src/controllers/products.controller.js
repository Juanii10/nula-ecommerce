import { prisma } from "../lib/prisma.js";

function serializeProduct(p) {
  return { ...p, images: JSON.parse(p.images) };
}

export async function listProducts(req, res) {
  const { category, q, sort } = req.query;

  const where = {};
  if (category) where.category = { slug: category };
  if (q) where.name = { contains: q };

  let orderBy = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: { category: true, variants: true },
  });

  res.json(products.map(serializeProduct));
}

export async function getFeatured(req, res) {
  const products = await prisma.product.findMany({
    where: { featured: true },
    include: { category: true, variants: true },
    take: 6,
  });
  res.json(products.map(serializeProduct));
}

export async function getProductBySlug(req, res) {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: { category: true, variants: true },
  });
  if (!product) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(serializeProduct(product));
}

export async function listCategories(req, res) {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  res.json(categories);
}

// --- Admin ---

export async function createProduct(req, res) {
  const { name, slug, description, price, categoryId, images, featured, variants } = req.body;

  if (!name || !slug || !price || !categoryId) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description: description || "",
      price: Number(price),
      categoryId,
      featured: Boolean(featured),
      images: JSON.stringify(images || []),
      variants: {
        create: (variants || []).map((v) => ({
          size: v.size,
          color: v.color,
          stock: Number(v.stock) || 0,
          sku: v.sku,
        })),
      },
    },
    include: { variants: true, category: true },
  });

  res.status(201).json(serializeProduct(product));
}

export async function updateProduct(req, res) {
  const { id } = req.params;
  const { name, description, price, categoryId, images, featured } = req.body;

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: Number(price) }),
      ...(categoryId && { categoryId }),
      ...(images && { images: JSON.stringify(images) }),
      ...(featured !== undefined && { featured: Boolean(featured) }),
    },
    include: { variants: true, category: true },
  });

  res.json(serializeProduct(product));
}

export async function deleteProduct(req, res) {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

export async function updateVariantStock(req, res) {
  const { variantId } = req.params;
  const { stock } = req.body;
  const variant = await prisma.variant.update({
    where: { id: variantId },
    data: { stock: Number(stock) },
  });
  res.json(variant);
}
