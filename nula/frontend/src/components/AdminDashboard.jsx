import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { authStore } from "../store/auth";
import { api } from "../lib/api.js";
import { formatPrice } from "../lib/format.js";

const STATUSES = ["pending", "paid", "shipped", "cancelled"];

export default function AdminDashboard() {
  const auth = useStore(authStore);
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  const isAdmin = auth?.token && auth.user.role === "admin";

  useEffect(() => {
    if (!isAdmin) return;
    api.allOrders(auth.token).then(setOrders).catch((e) => setError(e.message));
    api.getProducts().then(setProducts).catch((e) => setError(e.message));
    api.getCategories().then(setCategories).catch((e) => setError(e.message));
  }, [isAdmin]);

  if (!auth?.token) {
    return (
      <div>
        <p className="text-ink-soft mb-6">Necesitás ingresar con una cuenta de administrador.</p>
        <a href="/login" className="inline-flex border border-ink px-6 py-3 font-mono text-sm hover:bg-ink hover:text-paper transition-colors">
          INGRESAR
        </a>
      </div>
    );
  }

  if (!isAdmin) {
    return <p className="text-ink-soft">Tu cuenta no tiene permisos de administrador.</p>;
  }

  async function handleStatusChange(orderId, status) {
    try {
      await api.updateOrderStatus(orderId, status, auth.token);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeleteProduct(id) {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await api.deleteProduct(id, auth.token);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <div className="flex gap-6 border-b border-concrete/40 mb-8 font-mono text-sm">
        <button
          onClick={() => setTab("orders")}
          className={`pb-3 -mb-px border-b-2 transition-colors ${tab === "orders" ? "border-ink" : "border-transparent text-ink-soft"}`}
        >
          PEDIDOS ({orders.length})
        </button>
        <button
          onClick={() => setTab("products")}
          className={`pb-3 -mb-px border-b-2 transition-colors ${tab === "products" ? "border-ink" : "border-transparent text-ink-soft"}`}
        >
          PRODUCTOS ({products.length})
        </button>
      </div>

      {error && <p className="text-sm text-error mb-4">{error}</p>}

      {tab === "orders" && (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="border border-concrete/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-sm">#{o.id.slice(0, 8)}</p>
                  <p className="tag-label mt-1">{o.user.name} · {o.user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm">{formatPrice(o.total)}</span>
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    className="border border-concrete/50 bg-paper px-2 py-1 font-mono text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
              <ul className="mt-3 text-sm text-ink-soft space-y-1">
                {o.items.map((it) => (
                  <li key={it.id}>
                    {it.quantity}× {it.variant.product.name} (talle {it.variant.size}, {it.variant.color})
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {orders.length === 0 && <p className="text-ink-soft">Todavía no hay pedidos.</p>}
        </div>
      )}

      {tab === "products" && (
        <div>
          <NewProductForm
            categories={categories}
            token={auth.token}
            onCreated={(p) => setProducts((prev) => [p, ...prev])}
            onError={setError}
          />
          <div className="mt-8 divide-y divide-concrete/30 border-y border-concrete/30">
            {products.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm">{p.name}</p>
                  <p className="tag-label">{p.category.name} · {formatPrice(p.price)}</p>
                </div>
                <button
                  onClick={() => handleDeleteProduct(p.id)}
                  className="tag-label hover:text-error transition-colors"
                >
                  ELIMINAR
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NewProductForm({ categories, token, onCreated, onError }) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    categoryId: "",
  });
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const created = await api.createProduct(
        {
          ...form,
          price: Math.round(Number(form.price) * 100),
          images: [],
          variants: [
            { size: "M", color: "Negro", stock: 10, sku: `${form.slug}-M-NEGRO`.toUpperCase() },
          ],
        },
        token
      );
      onCreated(created);
      setForm({ name: "", slug: "", description: "", price: "", categoryId: "" });
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-concrete/40 p-4 grid gap-3 sm:grid-cols-2">
      <input
        placeholder="Nombre"
        required
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
        className="border border-concrete/50 bg-paper px-3 py-2 text-sm"
      />
      <input
        placeholder="Slug (url-amigable)"
        required
        value={form.slug}
        onChange={(e) => update("slug", e.target.value)}
        className="border border-concrete/50 bg-paper px-3 py-2 text-sm"
      />
      <input
        placeholder="Precio (ARS)"
        type="number"
        required
        value={form.price}
        onChange={(e) => update("price", e.target.value)}
        className="border border-concrete/50 bg-paper px-3 py-2 text-sm"
      />
      <select
        required
        value={form.categoryId}
        onChange={(e) => update("categoryId", e.target.value)}
        className="border border-concrete/50 bg-paper px-3 py-2 text-sm"
      >
        <option value="">Categoría</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <textarea
        placeholder="Descripción"
        value={form.description}
        onChange={(e) => update("description", e.target.value)}
        className="border border-concrete/50 bg-paper px-3 py-2 text-sm sm:col-span-2"
        rows={2}
      />
      <button
        type="submit"
        disabled={loading}
        className="sm:col-span-2 border border-ink py-2.5 font-mono text-sm hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
      >
        {loading ? "CREANDO..." : "CREAR PRODUCTO (variante inicial M/Negro)"}
      </button>
    </form>
  );
}
