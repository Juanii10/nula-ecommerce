import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Remeras", slug: "remeras" },
  { name: "Buzos", slug: "buzos" },
  { name: "Pantalones", slug: "pantalones" },
  { name: "Accesorios", slug: "accesorios" },
];

const SIZES = ["S", "M", "L", "XL"];

const PRODUCTS = [
  {
    name: "Remera Oversize Base",
    slug: "remera-oversize-base",
    description:
      "Remera de algodón peinado 24/1, calce oversize y cuello reforzado. La base de todo guardarropa NULA.",
    price: 1800000,
    category: "remeras",
    colors: ["Gris", "Blanco", "Negro"],
    featured: true,
    // Convención de nombres: "<color>-1" = frente, "<color>-2" = espalda.
    // El frontend filtra este array por el color elegido para armar la galería.
    images: [
      "/products/remera-oversize-base/gris-1.jpg",
      "/products/remera-oversize-base/gris-2.jpg",
      "/products/remera-oversize-base/negro-1.jpg",
      "/products/remera-oversize-base/negro-2.jpg",
      "/products/remera-oversize-base/blanco-1.jpg",
      "/products/remera-oversize-base/blanco-2.jpg",
    ],
  },
  {
    name: "Remera Estampa Frontal",
    slug: "remera-estampa-frontal",
    description:
      "Remera oversize con estampa gótica serigrafiada al frente y branding NULA en la espalda (\"Caos es Orden, Orden es Caos\" — MMXXIV). Tela 220g pre-lavada, no se deforma.",
    price: 2100000,
    category: "remeras",
    colors: ["Negro", "Beige"],
    featured: false,
    // "<color>-1"/"-2" = flat lay frente/espalda, "-3"/"-4" = foto en modelo
    images: [
      "/products/remera-estampa-frontal/negro-1.jpg",
      "/products/remera-estampa-frontal/negro-2.jpg",
      "/products/remera-estampa-frontal/negro-3.jpg",
      "/products/remera-estampa-frontal/negro-4.jpg",
      "/products/remera-estampa-frontal/beige-1.jpg",
      "/products/remera-estampa-frontal/beige-2.jpg",
    ],
  },
  {
    name: "Buzo Canguro Piezas",
    slug: "buzo-canguro-piezas",
    description:
      "Buzo canguro frisado por dentro, con bolsillo canguro y capucha forrada. Corte boxy, logo \"NULA — Beyond the Ordinary\" grabado en relieve al tono.",
    price: 4200000,
    category: "buzos",
    colors: ["Beige", "Negro"],
    featured: false,
    // "<color>-1" = frente, "<color>-2" = espalda
    images: [
      "/products/buzo-canguro-piezas/beige-1.jpg",
      "/products/buzo-canguro-piezas/beige-2.jpg",
      "/products/buzo-canguro-piezas/beige-3.jpg",
      "/products/buzo-canguro-piezas/negro-1.jpg",
      "/products/buzo-canguro-piezas/negro-2.jpg",
      "/products/buzo-canguro-piezas/negro-3.jpg",
    ],
  },
  {
    name: "Buzo Half Zip",
    slug: "buzo-half-zip",
    description:
      "Buzo half-zip colorblock con cuello alto tejido a rayas y estampa varsity \"NULA STUDIO — Built Different, Est. 2024\" al frente y espalda.",
    price: 4600000,
    category: "buzos",
    colors: ["Verde", "Negro", "Celeste"],
    featured: true,
    // "<color>-1" = frente flat, "-2" = espalda flat, "-3" = foto en modelo
    images: [
      "/products/buzo-half-zip/verde-3.jpg",
      "/products/buzo-half-zip/verde-1.jpg",
      "/products/buzo-half-zip/verde-2.jpg",
      "/products/buzo-half-zip/negro-3.jpg",
      "/products/buzo-half-zip/negro-1.jpg",
      "/products/buzo-half-zip/negro-2.jpg",
      "/products/buzo-half-zip/celeste-3.jpg",
      "/products/buzo-half-zip/celeste-1.jpg",
      "/products/buzo-half-zip/celeste-2.jpg",
    ],
  },
  {
    name: "Campera NULA",
    slug: "campera-jean",
    description:
      "Campera de jean oversize con capucha, logo NULA en la espalda con parche texturado y costura visible.",
    price: 5500000,
    category: "buzos",
    colors: ["Negro"],
    featured: true,
    // "<color>-1" = frente flat, "-2" = espalda flat, "-3" = foto en modelo
    images: [
      "/products/campera-jean/negro-4.jpg",
      "/products/campera-jean/negro-2.jpg",
      "/products/campera-jean/negro-3.jpg",
    ],
  },
  {
    name: "Pantalón Cargo Wide",
    slug: "pantalon-cargo-wide",
    description:
      "Cargo de calce ancho con seis bolsillos.",
    price: 3900000,
    category: "pantalones",
    colors: ["Negro", "Celeste"],
    featured: true,
    images: [
      "/products/pantalon-cargo-wide/cargo-2.jpg",
      "/products/pantalon-cargo-wide/cargo-1.jpg",
      "/products/pantalon-cargo-wide/cargo-3.jpg",
      "/products/pantalon-cargo-wide/cargo-celeste-3.jpg",
      "/products/pantalon-cargo-wide/cargo-celeste-1.jpg",
      "/products/pantalon-cargo-wide/cargo-celeste-2.jpg",
    ],
  },
  {
    name: "Pantalón Jogger Tapered",
    slug: "pantalon-jogger-tapered",
    description: "Jogger de frisa liviana con puño elastizado en el tobillo.",
    price: 3400000,
    category: "pantalones",
    colors: ["Negro", "Gris"],
    featured: false,
    // "<color>-1" = frente flat, "-2" = espalda flat, "-3" = foto en modelo
    images: [
      "/products/pantalon-jogger-tapered/negro-1.jpg",
      "/products/pantalon-jogger-tapered/negro-2.jpg",
      "/products/pantalon-jogger-tapered/negro-3.jpg",
    ],
  },
  {
    name: "Gorra Estructurada",
    slug: "gorra-estructurada",
    description: "Gorra de six panels con logo bordado y cierre trasero ajustable.",
    price: 1500000,
    category: "accesorios",
    colors: ["Negro"],
    sizes: ["Único"],
    featured: false,
    images: ["/products/gorra-estructurada/gorra-1.jpg"],
  },
  {
    name: "Bolso Tote Lona",
    slug: "bolso-tote-lona",
    description: "Tote de lona 12oz con manijas reforzadas, ideal para el día a día.",
    price: 1200000,
    category: "accesorios",
    colors: ["Crudo", "Negro"],
    sizes: ["Único"],
    featured: false,
    images: [
      "/products/bolso-tote-lona/crudo-1.jpg",
      "/products/bolso-tote-lona/negro-1.jpg",
    ],
  },
];

async function main() {
  console.log("Seed: borrando datos previos...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seed: creando categorías...");
  const categoryMap = {};
  for (const c of CATEGORIES) {
    const created = await prisma.category.create({ data: c });
    categoryMap[c.slug] = created.id;
  }

  console.log("Seed: creando productos y variantes...");
  for (const p of PRODUCTS) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        images: JSON.stringify(p.images),
        featured: p.featured,
        categoryId: categoryMap[p.category],
      },
    });

    const variantsData = [];
    const sizesForProduct = p.sizes || SIZES;
    for (const color of p.colors) {
      for (const size of sizesForProduct) {
        variantsData.push({
          productId: product.id,
          size,
          color,
          stock: Math.floor(Math.random() * 15) + 3,
          sku: `${p.slug}-${color}-${size}`.toUpperCase().replace(/\s+/g, "-"),
        });
      }
    }
    await prisma.variant.createMany({ data: variantsData });
  }

  console.log("Seed: creando usuario admin...");
  const passwordHash = await bcrypt.hash("admin1234", 10);
  await prisma.user.create({
    data: {
      email: "admin@nula.com",
      passwordHash,
      name: "Admin NULA",
      role: "admin",
    },
  });

  console.log("Seed completo. Admin: admin@nula.com / admin1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
