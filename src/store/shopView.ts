"use client";

import { create } from "zustand";

export type ShopView = "grid" | "compact" | "list";

const KEY = "rs-shop-view";

type ShopViewState = {
  view: ShopView;
  setView: (view: ShopView) => void;
};

/** Default view for SSR and the first client render (no mismatch). */
export const useShopView = create<ShopViewState>((set) => ({
  view: "grid",
  setView: (view) => set({ view }),
}));

export function readShopView(): ShopView {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === "compact" || saved === "list" ? saved : "grid";
  } catch {
    return "grid";
  }
}

export function persistShopView(view: ShopView) {
  try {
    localStorage.setItem(KEY, view);
  } catch {
    /* private mode / storage blocked — non-fatal */
  }
}
