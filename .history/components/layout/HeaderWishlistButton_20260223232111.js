"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "../hooks/useWishlist";

export default function HeaderWishlistButton() {
  const { count } = useWishlist();

  return (
   <>

    <Link
      href="/wishlist"
      className="cursor-pointer relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
    >
      <Heart className="w-5 h-5 text-slate-700" />

      {count > 0 && (
        <span className="absolute -top-2 -right-2 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold">
          {count}
        </span>
      )}
    </Link>
   
   </>
  );
}