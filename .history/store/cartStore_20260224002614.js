"use client";

import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";

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
 * Builds a human-readable label from a variant object.
 * Your variant has: attributes = '{"Size":"M"}' (JSON string)
 * Usage: buildVariantLabel(selectedVariant) => "Size: M"
 */
export function buildVariantLabel(variant) {
  if (!variant) return "";

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

  return variant?.name ?? variant?.value ?? (variant?.sku ? `SKU: ${variant.sku}` : "");
}

/**
 * Normalizes any payload into a consistent cart item.
 * Accepts both camelCase and snake_case keys.
 */
function normalizeIncomingItem(payload) {
  const productId =
    payload?.productId ??
    payload?.product_id ??
    null;

  const variantId =
    payload?.variantId ??
    payload?.variant_id ??
    payload?.variant?.id ??
    null;

  // SKU: prefer variant sku, fall back to product sku
  const sku =
    payload?.sku ??
    payload?.variantSku ??
    payload?.variant_sku ??
    payload?.variant?.sku ??
    null;

  const price = toNumberOrNull(
    payload?.price ??
    payload?.sale_price ??
    payload?.regular_price
  );

  const oldPrice = toNumberOrNull(
    payload?.oldPrice ??
    payload?.old_price ??
    payload?.regular_price
  );

  const variantLabel =
    payload?.variantLabel ??
    payload?.variant_label ??
    (payload?.variant ? buildVariantLabel(payload.variant) : "") ??
    "";

  return {
    lineId      : makeLineId({ productId, variantId }),
    productId,
    variantId,
    sku,
    name        : payload?.name ?? "Unnamed",
    category    : payload?.category ?? "",
    variantLabel,
    image       : payload?.image ?? payload?.featured_image ?? "",
    price,
    oldPrice,
    stock       : payload?.stock != null ? Number(payload.stock) : null,
    attrs       : payload?.attrs ?? payload?.attributes ?? null,
  };
}

const initialState = { items: [], coupon: null };

function reducer(state, action) {
  switch (action.type) {

    case "HYDRATE": {
      const next = action.payload;
      if (!next || !Array.isArray(next.items)) return state;
      return { items: next.items, coupon: next.coupon ?? null };
    }

    case "ADD_ITEM": {
      const incoming = normalizeIncomingItem(action.payload.item);
      const qtyToAdd = clampQty(action.payload.qty ?? 1);
      const idx      = state.items.findIndex((x) => x.lineId === incoming.lineId);

      if (idx >= 0) {
        const updated = [...state.items];
        updated[idx]  = {
          ...updated[idx],
          ...incoming,
          qty: clampQty((updated[idx].qty ?? 1) + qtyToAdd),
        };
        return { ...state, items: updated };
      }

      return { ...state, items: [...state.items, { ...incoming, qty: qtyToAdd }] };
    }

    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((x) => x.lineId !== action.payload.lineId) };

    case "SET_QTY": {
      const { lineId, qty } = action.payload;
      return {
        ...state,
        items: state.items.map((x) =>
          x.lineId === lineId ? { ...x, qty: clampQty(qty) } : x
        ),
      };
    }

    case "CLEAR":
      return { items: [], coupon: null };

    case "APPLY_COUPON":
      return { ...state, coupon: action.payload.coupon };

    case "REMOVE_COUPON":
      return { ...state, coupon: null };

    default:
      return state;
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const saved = loadCart();
    if (saved) dispatch({ type: "HYDRATE", payload: saved });
  }, []);

  useEffect(() => {
    saveCart(state);
  }, [state]);

  const api = useMemo(() => ({
    items       : state.items,
    coupon      : state.coupon,
    addItem     : (item, qty = 1) => dispatch({ type: "ADD_ITEM",     payload: { item, qty } }),
    removeItem  : (lineId)        => dispatch({ type: "REMOVE_ITEM",  payload: { lineId } }),
    setQty      : (lineId, qty)   => dispatch({ type: "SET_QTY",      payload: { lineId, qty } }),
    clearCart   : ()              => dispatch({ type: "CLEAR" }),
    applyCoupon : (coupon)        => dispatch({ type: "APPLY_COUPON", payload: { coupon } }),
    removeCoupon: ()              => dispatch({ type: "REMOVE_COUPON" }),
  }), [state]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider />");
  return ctx;
}
