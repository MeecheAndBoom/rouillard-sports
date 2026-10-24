"use client";

import { useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useCart } from "@/store/cart";
import { useToast } from "@/components/ui/Toast";
import type { Product } from "@/lib/types";

/**
 * Add-to-cart with an instant "added" state: feedback lands in the same frame
 * as the tap, and the button never resizes while it changes label.
 */
export function AddToCart({
  product,
  compact = false,
  full = false,
  initialQty = 1,
}: {
  product: Product;
  compact?: boolean;
  full?: boolean;
  initialQty?: number;
}) {
  const { t } = useLocale();
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const out = product.stock <= 0;
  const toast = useToast();

  function handleAdd() {
    if (out) return;
    add(
      {
        slug: product.slug,
        title: product.title,
        image: product.images[0] ?? "/images/placeholder.jpg",
        price: product.price,
        stock: product.stock,
      },
      initialQty,
    );
    setAdded(true);
    toast.show(t.common.added ?? "Added to cart");
    window.setTimeout(() => setAdded(false), 1600);
  }

  const base = full
    ? "btn btn-primary btn-lg w-full"
    : compact
      ? "btn btn-primary btn-sm"
      : "btn btn-primary";

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={out}
      aria-live="polite"
      className={`${base} min-w-0 ${added ? "!bg-success !text-pit" : ""}`}
    >
      <i
        className={`fa-solid ${added ? "fa-check" : out ? "fa-ban" : "fa-plus"} text-[11px]`}
        aria-hidden="true"
      />
      <span className="truncate">
        {out ? t.common.outOfStock : added ? t.common.added : t.common.addToCart}
      </span>
    </button>
  );
}
