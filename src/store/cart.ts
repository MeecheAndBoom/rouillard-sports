"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  slug: string;
  title: string;
  image: string;
  price: number;
  qty: number;
  stock: number;
};

type CartState = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
};

const MAX_PER_LINE = 99;

/**
 * Local cart — no account, no server round-trip until checkout.
 * Quantities are clamped to the stock snapshot so the checkout form never
 * submits more than the listing allows.
 */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],

      add: (line, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.slug === line.slug);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.slug === line.slug
                  ? {
                      ...l,
                      ...line,
                      qty: Math.min(l.qty + qty, Math.min(line.stock || MAX_PER_LINE, MAX_PER_LINE)),
                    }
                  : l,
              ),
            };
          }
          return {
            lines: [
              ...state.lines,
              {
                ...line,
                qty: Math.min(qty, Math.min(line.stock || MAX_PER_LINE, MAX_PER_LINE)),
              },
            ],
          };
        }),

      remove: (slug) =>
        set((state) => ({ lines: state.lines.filter((l) => l.slug !== slug) })),

      setQty: (slug, qty) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.slug === slug
              ? {
                  ...l,
                  qty: Math.max(
                    1,
                    Math.min(Number.isFinite(qty) ? qty : 1, Math.min(l.stock || MAX_PER_LINE, MAX_PER_LINE)),
                  ),
                }
              : l,
          ),
        })),

      clear: () => set({ lines: [] }),
    }),
    {
      name: "rs-cart",
      version: 1,
    },
  ),
);

export const cartCount = (lines: CartLine[]) =>
  lines.reduce((sum, l) => sum + l.qty, 0);

export const cartSubtotal = (lines: CartLine[]) =>
  lines.reduce((sum, l) => sum + l.price * l.qty, 0);
