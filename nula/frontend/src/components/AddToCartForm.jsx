import { useMemo, useState } from "react";
import { addToCart } from "../store/cart";
import { formatPrice } from "../lib/format.js";

export default function AddToCartForm({ product }) {
  const sizes = useMemo(
    () => [...new Set(product.variants.map((v) => v.size))],
    [product]
  );
  const colors = useMemo(
    () => [...new Set(product.variants.map((v) => v.color))],
    [product]
  );

  const [size, setSize] = useState(sizes[0] || "");
  const [color, setColor] = useState(colors[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const selectedVariant = product.variants.find(
    (v) => v.size === size && v.color === color
  );

  function handleAdd() {
    setError("");
    if (!selectedVariant) {
      setError("Elegí talle y color.");
      return;
    }
    if (selectedVariant.stock < quantity) {
      setError(`Solo quedan ${selectedVariant.stock} unidades de esta combinación.`);
      return;
    }
    addToCart({
      variantId: selectedVariant.id,
      productSlug: product.slug,
      productName: product.name,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: product.price,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="tag-label mb-2">TALLE</p>
        <div className="flex gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`h-10 w-10 border font-mono text-sm transition-colors ${
                size === s
                  ? "bg-ink text-paper border-ink"
                  : "border-concrete/50 hover:border-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="tag-label mb-2">COLOR</p>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`border px-3 py-1.5 font-mono text-sm transition-colors ${
                color === c
                  ? "bg-ink text-paper border-ink"
                  : "border-concrete/50 hover:border-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="tag-label mb-2">CANTIDAD</p>
        <div className="flex items-center border border-concrete/50 w-fit">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-10 w-10 hover:bg-paper-dim transition-colors"
          >
            −
          </button>
          <span className="w-10 text-center font-mono text-sm">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="h-10 w-10 hover:bg-paper-dim transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {selectedVariant && (
        <p className="tag-label">
          {selectedVariant.stock > 0
            ? `${selectedVariant.stock} disponibles`
            : "Sin stock en esta combinación"}
        </p>
      )}

      {error && <p className="text-sm text-error">{error}</p>}

      <button
        type="button"
        onClick={handleAdd}
        disabled={!selectedVariant || selectedVariant.stock < 1}
        className="w-full border border-ink py-3 font-mono text-sm hover:bg-ink hover:text-paper transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ink"
      >
        {added ? "AGREGADO ✓" : `AGREGAR — ${formatPrice(product.price)}`}
      </button>
    </div>
  );
}
