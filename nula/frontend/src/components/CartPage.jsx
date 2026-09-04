import { useStore } from "@nanostores/react";
import { cartItems, cartTotal, removeFromCart, updateQuantity } from "../store/cart";
import { formatPrice } from "../lib/format.js";

export default function CartPage() {
  const items = useStore(cartItems);
  const total = useStore(cartTotal);

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-ink-soft mb-6">Todavía no agregaste nada al carrito.</p>
        <a
          href="/catalogo"
          className="inline-flex border border-ink px-6 py-3 font-mono text-sm hover:bg-ink hover:text-paper transition-colors"
        >
          VER CATÁLOGO
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-3">
      <div className="lg:col-span-2 divide-y divide-concrete/30 border-y border-concrete/30">
        {items.map((item) => (
          <div key={item.variantId} className="flex gap-4 py-5">
            <div className="h-24 w-20 shrink-0 bg-paper-dim border border-concrete/40 overflow-hidden">
              {item.image && (
                <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm">{item.productName}</p>
                  <p className="tag-label mt-1">
                    TALLE {item.size} · {item.color.toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.variantId)}
                  className="tag-label hover:text-error transition-colors"
                >
                  QUITAR
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center border border-concrete/50 w-fit">
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    className="h-8 w-8 hover:bg-paper-dim transition-colors"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-mono text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    className="h-8 w-8 hover:bg-paper-dim transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="font-mono text-sm">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-fit border border-concrete/40 p-6">
        <div className="flex items-baseline justify-between">
          <p className="tag-label">TOTAL</p>
          <p className="font-display text-2xl">{formatPrice(total)}</p>
        </div>
        <p className="tag-label mt-2 text-concrete">Envío calculado en el checkout</p>
        <a
          href="/checkout"
          className="mt-6 block text-center border border-ink py-3 font-mono text-sm hover:bg-ink hover:text-paper transition-colors"
        >
          IR A PAGAR
        </a>
      </div>
    </div>
  );
}
