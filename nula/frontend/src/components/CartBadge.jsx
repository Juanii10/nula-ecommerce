import { useStore } from "@nanostores/react";
import { cartCount } from "../store/cart";

export default function CartBadge() {
  const count = useStore(cartCount);
  return (
    <a
      href="/carrito"
      className="relative font-mono text-sm tracking-wide hover:text-olive transition-colors"
    >
      CARRITO
      {count > 0 && (
        <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[11px] text-paper">
          {count}
        </span>
      )}
    </a>
  );
}
