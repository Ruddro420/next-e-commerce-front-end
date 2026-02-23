"use client";

import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";

/** =========================
 * LocalStorage helpers
 * ========================= */
const STORAGE_KEY = "bs_cart_v1";

function safeParse(json, fallback) {
  try {
    return JSON.parse(json) ?? fallback;
  } catch {
    return fallback;
  }
}

function loadCart() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  return safeParse(raw, null);
}

function saveCart(state) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** =========================
 * Cart item normalization
 * ========================= */
function makeLineId({ productId, variantId }) {
  // each unique product+variant becomes a unique line
  return `p:${productId ?? "?"}|v:${variantId ?? "none"}`;
}

function clampQty(q) {
  const n = Number(q);
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(99, Math.floor(n)));
}

function toNumberOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Expected shape of item you add:
 * {
 *  productId, variantId,
 *  name, category, variantLabel,
 *  image,
 *  price, oldPrice,
 *  stock (optional),
 *  attrs (optional) { Size:"M", Color:"Black" },
 *  sku (optional),
 * }
 */
function normalizeIncomingItem(payload) {
  const productId = payload?.productId ?? payload?.product_id;
  const variantId = payload?.variantId ?? payload?.variant_id ?? null;

  return {
    lineId: makeLineId({ productId, variantId }),
    productId: productId,
    product_id: productId, // ✅ Add snake_case version
    variantId: variantId,
    variant_id: variantId, // ✅ Add snake_case version for backend
    name: payload?.name ?? "Unnamed",
    category: payload?.category ?? "",
    variantLabel: payload?.variantLabel ?? payload?.variant ?? "",
    image: payload?.image ?? "",
    price: toNumberOrNull(payload?.price),
    oldPrice: toNumberOrNull(payload?.oldPrice),
    stock: payload?.stock != null ? Number(payload.stock) : null,
    attrs: payload?.attrs ?? null,
    sku: payload?.sku ?? null,
  };
}

/** =========================
 * Reducer
 * ========================= */
const initialState = {
  items: [],
  coupon: null, // e.g. "SAVE10"
};

function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE": {
      const next = action.payload;
      if (!next || !Array.isArray(next.items)) return state;
      return {
        items: next.items,
        coupon: next.coupon ?? null,
      };
    }

    case "ADD_ITEM": {
      const incoming = normalizeIncomingItem(action.payload.item);
      const qtyToAdd = clampQty(action.payload.qty ?? 1);

      const idx = state.items.findIndex((x) => x.lineId === incoming.lineId);

      if (idx >= 0) {
        const updated = [...state.items];
        const prev = updated[idx];
        updated[idx] = { 
          ...prev, 
          qty: clampQty((prev.qty ?? 1) + qtyToAdd),
          // Update fields in case they changed
          sku: incoming.sku ?? prev.sku,
          variantId: incoming.variantId ?? prev.variantId,
          variant_id: incoming.variant_id ?? prev.variant_id,
        };
        return { ...state, items: updated };
      }

      return {
        ...state,
        items: [...state.items, { ...incoming, qty: qtyToAdd }],
      };
    }

    case "REMOVE_ITEM": {
      return { ...state, items: state.items.filter((x) => x.lineId !== action.payload.lineId) };
    }

    case "SET_QTY": {
      const { lineId, qty } = action.payload;
      const nextQty = clampQty(qty);

      return {
        ...state,
        items: state.items.map((x) => (x.lineId === lineId ? { ...x, qty: nextQty } : x)),
      };
    }

    case "CLEAR": {
      return { items: [], coupon: null };
    }

    case "APPLY_COUPON": {
      return { ...state, coupon: action.payload.coupon };
    }

    case "REMOVE_COUPON": {
      return { ...state, coupon: null };
    }

    default:
      return state;
  }
}

/** =========================
 * Context
 * ========================= */
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // hydrate from localStorage once
  useEffect(() => {
    const saved = loadCart();
    if (saved) dispatch({ type: "HYDRATE", payload: saved });
  }, []);

  // persist on change
  useEffect(() => {
    saveCart(state);
  }, [state]);

  const api = useMemo(() => {
    return {
      items: state.items,
      coupon: state.coupon,

      addItem: (item, qty = 1) => dispatch({ type: "ADD_ITEM", payload: { item, qty } }),
      removeItem: (lineId) => dispatch({ type: "REMOVE_ITEM", payload: { lineId } }),
      setQty: (lineId, qty) => dispatch({ type: "SET_QTY", payload: { lineId, qty } }),
      clearCart: () => dispatch({ type: "CLEAR" }),

      applyCoupon: (code) => dispatch({ type: "APPLY_COUPON", payload: { coupon: code } }),
      removeCoupon: () => dispatch({ type: "REMOVE_COUPON" }),
    };
  }, [state]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider />");
  return ctx;
}