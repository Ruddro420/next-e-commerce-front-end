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

function normalizeIncomingItem(payload) {
  const productId = payload?.productId ?? payload?.product_id;
  const variantId = payload?.variantId ?? payload?.variant_id ?? null;
  
  console.log("Normalizing incoming item:", payload); // Debug log

  // Explicitly extract all fields
  return {
    // Line identifier
    lineId: makeLineId({ productId, variantId }),
    
    // IDs - both camelCase and snake_case
    productId: productId,
    product_id: productId,
    variantId: variantId,
    variant_id: variantId,
    
    // Product info
    name: payload?.name ?? "Unnamed",
    category: payload?.category ?? "",
    
    // Variant info
    variantLabel: payload?.variantLabel ?? payload?.variant ?? "",
    
    // Media
    image: payload?.image ?? "",
    
    // Pricing
    price: toNumberOrNull(payload?.price),
    oldPrice: toNumberOrNull(payload?.oldPrice),
    
    // Stock
    stock: payload?.stock != null ? Number(payload.stock) : null,
    
    // Attributes
    attrs: payload?.attrs ?? null,
    
    // IMPORTANT: SKU and other fields
    sku: payload?.sku ?? null,
    
    // Quantity (will be set by reducer)
    qty: 1, // Default, will be overridden
  };
}

/** =========================
 * Reducer
 * ========================= */
const initialState = {
  items: [],
  coupon: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE": {
      const next = action.payload;
      if (!next || !Array.isArray(next.items)) return state;
      console.log("Hydrating from localStorage:", next); // Debug log
      return {
        items: next.items,
        coupon: next.coupon ?? null,
      };
    }

    case "ADD_ITEM": {
      const incoming = normalizeIncomingItem(action.payload.item);
      const qtyToAdd = clampQty(action.payload.qty ?? 1);
      
      console.log("Adding item to cart:", incoming); // Debug log

      const idx = state.items.findIndex((x) => x.lineId === incoming.lineId);

      if (idx >= 0) {
        const updated = [...state.items];
        const prev = updated[idx];
        updated[idx] = { 
          ...prev, 
          qty: clampQty((prev.qty ?? 1) + qtyToAdd),
          // Preserve all fields
          sku: incoming.sku ?? prev.sku,
          variantId: incoming.variantId ?? prev.variantId,
          variant_id: incoming.variant_id ?? prev.variant_id,
          productId: incoming.productId ?? prev.productId,
          product_id: incoming.product_id ?? prev.product_id,
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

  useEffect(() => {
    const saved = loadCart();
    if (saved) {
      console.log("Loaded cart from localStorage:", saved); // Debug log
      dispatch({ type: "HYDRATE", payload: saved });
    }
  }, []);

  useEffect(() => {
    console.log("Saving cart to localStorage:", state); // Debug log
    saveCart(state);
  }, [state]);

  const api = useMemo(() => {
    return {
      items: state.items,
      coupon: state.coupon,

      addItem: (item, qty = 1) => {
        console.log("addItem called with:", { item, qty }); // Debug log
        dispatch({ type: "ADD_ITEM", payload: { item, qty } });
      },
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