import { useState } from "react";
import { useStore } from "@nanostores/react";
import { authStore } from "../store/auth";
import { cartItems, cartTotal, clearCart } from "../store/cart";
import { formatPrice } from "../lib/format.js";
import { api } from "../lib/api.js";

export default function CheckoutForm() {
  const auth = useStore(authStore);
  const items = useStore(cartItems);
  const total = useStore(cartTotal);

  const [form, setForm] = useState({ name: "", address: "", city: "", zip: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  if (!auth?.token) {
    return (
      <div className="max-w-sm">
        <p className="text-ink-soft mb-6">
          Necesitás una cuenta para finalizar la compra.
        </p>
        <a
          href="/login"
          className="inline-flex border border-ink px-6 py-3 font-mono text-sm hover:bg-ink hover:text-paper transition-colors"
        >
          INGRESAR
        </a>
      </div>
    );
  }

  if (order) {
    return (
      <div className="max-w-md">
        <p className="tag-label mb-2">PEDIDO CONFIRMADO</p>
        <h2 className="font-display text-3xl mb-4">¡Gracias, {form.name.split(" ")[0]}!</h2>
        <p className="text-ink-soft">
          Tu pedido <span className="font-mono text-ink">#{order.id.slice(0, 8)}</span> por{" "}
          <strong className="text-ink">{formatPrice(order.total)}</strong> quedó confirmado.
          Se envía a {form.address}, {form.city}.
        </p>
        <a
          href="/"
          className="mt-8 inline-flex border border-ink px-6 py-3 font-mono text-sm hover:bg-ink hover:text-paper transition-colors"
        >
          VOLVER AL INICIO
        </a>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <p className="text-ink-soft mb-6">Tu carrito está vacío.</p>
        <a
          href="/catalogo"
          className="inline-flex border border-ink px-6 py-3 font-mono text-sm hover:bg-ink hover:text-paper transition-colors"
        >
          VER CATÁLOGO
        </a>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        shipping: form,
      };
      const created = await api.checkout(payload, auth.token);
      setOrder(created);
      clearCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-12 lg:grid-cols-3">
      <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
        <div>
          <label className="tag-label block mb-1.5">NOMBRE Y APELLIDO</label>
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full border border-concrete/50 bg-paper px-3 py-2.5 text-sm focus:border-ink outline-none"
          />
        </div>
        <div>
          <label className="tag-label block mb-1.5">DIRECCIÓN</label>
          <input
            required
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            className="w-full border border-concrete/50 bg-paper px-3 py-2.5 text-sm focus:border-ink outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="tag-label block mb-1.5">CIUDAD</label>
            <input
              required
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              className="w-full border border-concrete/50 bg-paper px-3 py-2.5 text-sm focus:border-ink outline-none"
            />
          </div>
          <div>
            <label className="tag-label block mb-1.5">CÓDIGO POSTAL</label>
            <input
              required
              value={form.zip}
              onChange={(e) => update("zip", e.target.value)}
              className="w-full border border-concrete/50 bg-paper px-3 py-2.5 text-sm focus:border-ink outline-none"
            />
          </div>
        </div>
        <div>
          <label className="tag-label block mb-1.5">TELÉFONO</label>
          <input
            required
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="w-full border border-concrete/50 bg-paper px-3 py-2.5 text-sm focus:border-ink outline-none"
          />
        </div>

        <div className="border border-concrete/40 p-4">
          <p className="tag-label mb-1">PAGO</p>
          <p className="text-sm text-ink-soft">
            Simulado para este proyecto — no se procesa ningún cobro real. En producción
            acá se integraría Stripe o Mercado Pago.
          </p>
        </div>

        {error && <p className="text-sm text-error">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full border border-ink py-3 font-mono text-sm hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
        >
          {loading ? "PROCESANDO..." : `CONFIRMAR PEDIDO — ${formatPrice(total)}`}
        </button>
      </form>

      <div className="h-fit border border-concrete/40 p-6">
        <p className="tag-label mb-4">TU PEDIDO</p>
        <div className="space-y-3 text-sm">
          {items.map((i) => (
            <div key={i.variantId} className="flex justify-between">
              <span>
                {i.productName} × {i.quantity}
                <span className="block tag-label">TALLE {i.size} · {i.color}</span>
              </span>
              <span className="font-mono">{formatPrice(i.price * i.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-concrete/40 flex justify-between font-display text-xl">
          <span>TOTAL</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
