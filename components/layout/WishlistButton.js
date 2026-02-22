"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "../hooks/useWishlist";

export function WishlistButton({ productId }) {
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(productId);

  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      className="cursor-pointer absolute right-5 top-5 h-11 w-11 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-slate-50 transition"
      aria-label="Toggle wishlist"
      title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`w-5 h-5 ${wishlisted ? "text-rose-600" : "text-slate-700"}`}
        fill={wishlisted ? "currentColor" : "none"}
      />
    </button>
  );
}