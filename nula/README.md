# NULA — E-commerce de indumentaria (proyecto de portfolio)

Proyecto full-stack de e-commerce: catálogo, carrito, checkout, cuentas de
usuario y panel de administración. Pensado como si fuera un pedido real de
cliente: una marca de ropa urbana.

## Estructura

```
nula/
  backend/   → API REST (Node.js + Express + Prisma + SQLite)
  frontend/  → Sitio (Astro SSR + React + Tailwind v4)
```

## Puesta en marcha

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init   # crea la base SQLite y las tablas
npm run seed                          # carga categorías, productos y el admin
npm run dev                           # http://localhost:4000
```

Usuario admin de prueba: `admin@nula.com` / `admin1234`

### 2. Frontend

En otra terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev   # http://localhost:4321
```

## Qué incluye

**Backend**
- Auth con JWT (registro/login), contraseñas hasheadas con bcrypt
- CRUD de productos con variantes (talle/color/stock) y categorías
- Checkout transaccional: valida stock, calcula total y descuenta stock
  dentro de una transacción de Prisma (si algo falla, no queda nada a medias)
- Rutas de admin protegidas por rol (`requireAuth` + `requireAdmin`)
- Historial de pedidos por usuario y vista de todos los pedidos para admin

**Frontend**
- Astro en modo SSR (los datos vienen en vivo de la API, no son estáticos)
- Carrito persistente en el navegador (nanostores + localStorage)
- Selector de talle/color con validación de stock antes de agregar al carrito
- Checkout con formulario de envío y confirmación de pedido
- Panel `/admin`: gestión de pedidos (cambiar estado) y alta/baja de productos
- Sistema de diseño propio (paleta oliva/papel, tipografía Big Shoulders
  Display + IBM Plex) distinto al de tu portfolio personal

## Lo que falta para que sea 100% producción

Quedó armado como un proyecto completo y funcional, pero para un cliente real
todavía sumaría:

- **Pago real**: hoy el checkout simula el pago y marca el pedido como
  `paid` directo. El punto de integración está marcado en
  `backend/src/controllers/orders.controller.js` — ahí conectarías Stripe
  o Mercado Pago (checkout + webhook de confirmación).
- **Imágenes de producto reales**: el seed usa rutas de ejemplo
  (`/products/*.jpg`) que no existen; el front muestra un placeholder con
  el nombre de la categoría en su lugar. Subí fotos reales a
  `frontend/public/products/` y ajustá el seed o el panel admin.
- **Base de datos para producción**: SQLite es perfecto para desarrollar;
  para deployar cambiá el `DATABASE_URL` a Postgres (Prisma lo soporta sin
  tocar el schema, solo el `provider`).
- **Emails transaccionales** (confirmación de compra) — no implementado.
- **Refresh tokens** — el JWT actual dura 7 días fijos, sin renovación.

## Notas de implementación

- Los precios se guardan en centavos (enteros) para evitar errores de
  punto flotante con dinero.
- El carrito vive enteramente en el navegador; recién se valida contra
  stock real en el momento del checkout (así evitamos tener que loguear
  usuarios solo para armar el carrito).
