"use client";

import { useEffect, useState } from "react";

const WISHLIST_KEY = "wishlist_product_ids";
const WISHLIST_EVENT = "wishlist_updated";

function readWishlist() {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWishlist(ids) {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  } catch {}
  window.dispatchEvent(new Event(WISHLIST_EVENT)); // ✅ same tab
}

export function useWishlist() {
  const [ids, setIds] = useState([]);

  useEffect(() => {
    const sync = () => setIds(readWishlist());
    sync();

    const onWishlistUpdated = () => sync();
    const onStorage = (e) => {
      if (e.key === WISHLIST_KEY) sync();
    };

    window.addEventListener(WISHLIST_EVENT, onWishlistUpdated);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(WISHLIST_EVENT, onWishlistUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const toggle = (productId) => {
    const current = readWishlist();
    const next = current.includes(productId)
      ? current.filter((x) => x !== productId)
      : [...current, productId];

    writeWishlist(next);
    setIds(next); // ✅ instant UI update
  };

  const isWishlisted = (productId) => ids.includes(productId);

  return { ids, count: ids.length, toggle, isWishlisted };
}