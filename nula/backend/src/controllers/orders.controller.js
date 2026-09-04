import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "El carrito está vacío"),
  shipping: z.object({
    name: z.string().min(2),
    address: z.string().min(5),
    city: z.string().min(2),
    zip: z.string().min(3),
    phone: z.string().min(6),
  }),
});

export async function checkout(req, res) {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { items, shipping } = parsed.data;

  try {
    const order = await prisma.$transaction(async (tx) => {
      let total = 0;
      const orderItemsData = [];

      for (const item of items) {
        const variant = await tx.variant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });

        if (!variant) {
          throw Object.assign(new Error("Variante no encontrada"), {
            status: 404,
            publicMessage: "Uno de los productos del carrito ya no existe",
          });
        }
        if (variant.stock < item.quantity) {
          throw Object.assign(new Error("Sin stock"), {
            status: 409,
            publicMessage: `Sin stock suficiente de "${variant.product.name}" (talle ${variant.size}, color ${variant.color})`,
          });
        }

        total += variant.product.price * item.quantity;
        orderItemsData.push({
          variantId: variant.id,
          quantity: item.quantity,
          priceAtPurchase: variant.product.price,
        });

        await tx.variant.update({
          where: { id: variant.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Simulación de pago: en producción acá se integraría Stripe/Mercado Pago
      // y el estado quedaría en "pending" hasta confirmar el webhook.
      return tx.order.create({
        data: {
          userId: req.user.id,
          total,
          status: "paid",
          shippingName: shipping.name,
          shippingAddress: shipping.address,
          shippingCity: shipping.city,
          shippingZip: shipping.zip,
          shippingPhone: shipping.phone,
          items: { create: orderItemsData },
        },
        include: { items: { include: { variant: { include: { product: true } } } } },
      });
    });

    res.status(201).json(order);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.publicMessage || "No se pudo procesar la compra" });
  }
}

export async function listMyOrders(req, res) {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });
  res.json(orders);
}

export async function getOrderById(req, res) {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });
  if (!order) return res.status(404).json({ error: "Pedido no encontrado" });
  if (order.userId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "No tenés acceso a este pedido" });
  }
  res.json(order);
}

// --- Admin ---

export async function listAllOrders(req, res) {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { variant: { include: { product: true } } } },
    },
  });
  res.json(orders);
}

export async function updateOrderStatus(req, res) {
  const { status } = req.body;
  const allowed = ["pending", "paid", "shipped", "cancelled"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Estado inválido" });
  }
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json(order);
}
