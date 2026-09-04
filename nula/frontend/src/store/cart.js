import { persistentAtom } from "@nanostores/persistent";
import { computed } from "nanostores";

// Cada item: { variantId, productSlug, productName, size, color, price, quantity, image }
export const cartItems = persistentAtom("nula-cart", [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export function addToCart(item) {
  const current = cartItems.get();
  const existing = current.find((i) => i.variantId === item.variantId);

  if (existing) {
    cartItems.set(
      current.map((i) =>
        i.variantId === item.variantId
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      )
    );
  } else {
    cartItems.set([...current, item]);
  }
}

export function removeFromCart(variantId) {
  cartItems.set(cartItems.get().filter((i) => i.variantId !== variantId));
}

export function updateQuantity(variantId, quantity) {
  if (quantity < 1) return removeFromCart(variantId);
  cartItems.set(
    cartItems.get().map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
  );
}

export function clearCart() {
  cartItems.set([]);
}

export const cartCount = computed(cartItems, (items) =>
  items.reduce((sum, i) => sum + i.quantity, 0)
);

export const cartTotal = computed(cartItems, (items) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0)
);
