import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";

// Output "server" porque el catálogo, productos, carrito y checkout dependen
// de datos en vivo de la API (stock, precios, pedidos) — no tiene sentido
// pre-renderear esto como sitio estático.
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
