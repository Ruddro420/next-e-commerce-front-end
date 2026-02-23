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

/**
 * Builds a human-readable variant label from a variant's attributes JSON.
 * Accepts either a parsed object or a JSON string.
 *
 * Examples:
 *   { Size: "M" }              → "Size: M"
 *   { Size: "M", Color: "Red"} → "Size: M, Color: Red"
 *   "{"Size":"M"}"             → "Size: M"
 */
export function buildVariantLabel(variant) {
  if (!variant) return "";

  // Already have a label string
  if (typeof variant === "string") return variant;

  // variant is a full object from the API (has attributes field)
  if (variant?.attributes) {
    const attrs =
      typeof variant.attributes === "string"
        ? safeParse(variant.attributes, {})
        : variant.attributes;

    if (attrs && typeof attrs === "object") {
      const parts = Object.entries(attrs).map(([k, v]) => `${k}: ${v}`);
      if (parts.length) return parts.join(", ");
    }
  }

  // Fallback: use name, value, or sku from variant
  return variant?.name ?? variant?.value ?? (variant?.sku ? `SKU: ${variant.sku}` : "");
}

/**
 * Normalizes any incoming item payload into a consistent cart item shape.
 *
 * Call addItem() with this shape from your product page:
 * {
 *   productId    : number,
 *   variantId    : number | null,
 *   name         : string,
 *   price        : number,           // use variant sale_price > regular_price > product price
 *   oldPrice     : number | null,    // original price for strikethrough
 *   stock        : number | null,
 *   image        : string,
 *   category     : string,
 *   variantLabel : string,           // e.g. "Size: M" — use buildVariantLabel(variant)
 *   sku          : string | null,    // variant sku or product sku
 *   attrs        : object | null,    // raw { Size: "M", Color: "Red" }
 * }
 */
function normalizeIncomingItem(payload) {
  const productId = payload?.productId ?? payload?.product_id ?? null;
  const variantId = payload?.variantId ?? payload?.variant_id ?? null;

  return {
    lineId      : makeLineId({ productId, variantId }),
    productId,
    variantId,
    name        : payload?.name        ?? "Unnamed",
    category    : payload?.category    ?? "",
    variantLabel: payload?.variantLabel ?? payload?.variant ?? "",
    image       : payload?.image       ?? "",
    price       : toNumberOrNull(payload?.price),
    oldPrice    : toNumberOrNull(payload?.oldPrice ?? payload?.old_price),
    stock       : payload?.stock != null ? Number(payload.stock) : null,
    attrs       : payload?.attrs       ?? null,
    sku         : payload?.sku         ?? null,   // ✅ stored for checkout payload
  };
}

/** =========================
 * Reducer
 * ========================= */
const initialState = {
  items  : [],
  coupon : null,
};

function reducer(state, action) {
  switch (action.type) {

    case "HYDRATE": {
      const next = action.payload;
      if (!next || !Array.isArray(next.items)) return state;
      return {
        items  : next.items,
        coupon : next.coupon ?? null,
      };
    }

    case "ADD_ITEM": {
      const incoming = normalizeIncomingItem(action.payload.item);
      const qtyToAdd = clampQty(action.payload.qty ?? 1);
      const idx      = state.items.findIndex((x) => x.lineId === incoming.lineId);

      if (idx >= 0) {
        // Item already in cart — increment qty, but refresh price/stock in case they changed
        const updated = [...state.items];
        const prev    = updated[idx];
        updated[idx]  = {
          ...prev,
          ...incoming,                                       // refresh metadata
          qty: clampQty((prev.qty ?? 1) + qtyToAdd),        // keep accumulated qty
        };
        return { ...state, items: updated };
      }

      return {
        ...state,
        items: [...state.items, { ...incoming, qty: qtyToAdd }],
      };
    }

    case "REMOVE_ITEM": {
      return {
        ...state,
        items: state.items.filter((x) => x.lineId !== action.payload.lineId),
      };
    }

    case "SET_QTY": {
      const { lineId, qty } = action.payload;
      return {
        ...state,
        items: state.items.map((x) =>
          x.lineId === lineId ? { ...x, qty: clampQty(qty) } : x
        ),
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

  // Hydrate from localStorage on first render
  useEffect(() => {
    const saved = loadCart();
    if (saved) dispatch({ type: "HYDRATE", payload: saved });
  }, []);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    saveCart(state);
  }, [state]);

  const api = useMemo(() => ({
    items     : state.items,
    coupon    : state.coupon,

    /**
     * Add an item to the cart.
     *
     * Usage on product page:
     *   const { addItem } = useCart();
     *
     *   addItem({
     *     productId   : product.id,
     *     variantId   : selectedVariant?.id ?? null,
     *     name        : product.name,
     *     price       : selectedVariant?.sale_price
     *                     || selectedVariant?.regular_price
     *                     || product.price,
     *     oldPrice    : selectedVariant?.regular_price ?? null,
     *     stock       : selectedVariant?.stock ?? product.stock ?? null,
     *     image       : product.featured_image ?? "",
     *     category    : product.category?.name ?? "",
     *     variantLabel: buildVariantLabel(selectedVariant),   // "Size: M"
     *     sku         : selectedVariant?.sku || product.sku || null,
     *     attrs       : selectedVariant?.attributes ?? null,
     *   }, qty);
     */
    addItem     : (item, qty = 1) => dispatch({ type: "ADD_ITEM",      payload: { item, qty } }),
    removeItem  : (lineId)        => dispatch({ type: "REMOVE_ITEM",   payload: { lineId } }),
    setQty      : (lineId, qty)   => dispatch({ type: "SET_QTY",       payload: { lineId, qty } }),
    clearCart   : ()              => dispatch({ type: "CLEAR" }),
    applyCoupon : (coupon)        => dispatch({ type: "APPLY_COUPON",  payload: { coupon } }),
    removeCoupon: ()              => dispatch({ type: "REMOVE_COUPON" }),
  }), [state]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider />");
  return ctx;
}
