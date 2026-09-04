import { PrismaClient } from "@prisma/client";

// Instancia única de Prisma reutilizada en toda la app (evita agotar conexiones en dev con hot-reload)
export const prisma = new PrismaClient();
