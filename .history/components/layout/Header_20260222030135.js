"use client";

import Container from "@/components/ui/Container";
import { Heart, ShoppingCart, User } from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { useCart } from "@/store/cartStore";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";

/* eslint-disable @next/next/no-html-link-for-pages */
export default function Header() {
  const { items } = useCart();
  const { customer, loading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = useMemo(() => {
    return items.reduce((sum, it) => sum + (it.qty ?? 1), 0);
  }, [items]);

  const handleLogout = async () => {
    await logout();
  };

  // Don't render auth-dependent content until after hydration
  if (!mounted) {
    return (
      <header className="bg-white border-b border-gray-200">
        <Container className="py-3 flex items-center gap-3">
          {/* Logo - always visible */}
          <a href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-600" />
            <div className="leading-tight">
              <div className="font-extrabold text-lg">ShopBangla</div>
              <div className="text-xs text-slate-500">BD • ঢাকা</div>
            </div>
          </a>

          {/* Search (desktop) */}
          <div className="flex-1 hidden md:flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                className="w-full rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="পণ্য সার্চ করুন (যেমন: গাড়ি, ইলিশ, মুড়ি)"
              />
              <button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white">
                খুঁজুন
              </button>
            </div>
          </div>

          {/* Actions - show loading state */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="w-24 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </Container>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <Container className="py-3 flex items-center gap-3">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-600" />
          <div className="leading-tight">
            <div className="font-extrabold text-lg">ShopBangla</div>
            <div className="text-xs text-slate-500">BD • ঢাকা</div>
          </div>
        </a>

        {/* Search (desktop) */}
        <div className="flex-1 hidden md:flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              className="w-full rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="পণ্য সার্চ করুন (যেমন: গাড়ি, ইলিশ, মুড়ি)"
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white">
              খুঁজুন
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-auto">
          <button className="cursor-pointer hidden lg:inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm">
            🎁 <span>বিশেষ অফার</span>
          </button>

          {/* Wishlist (static for now) */}
          <button className="cursor-pointer relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-white">
            <Heart className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5">
              12
            </span>
          </button>

          {/* Cart (dynamic) */}
          <a
            href="/cart"
            className="cursor-pointer relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-white"
            aria-label="Go to cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 ? (
              <span className="absolute -top-2 -right-2 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5">
                {cartCount}
              </span>
            ) : null}
          </a>

          {/* Conditional Auth Button */}
          {customer ? (
            <div className="relative group">
              <Link
                href="/account"
                className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">My Account</span>
              </Link>
              
              {/* Dropdown menu on hover/click - optional */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 hidden group-hover:block hover:block z-50">
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold">{customer.name}</p>
                    <p className="text-xs text-slate-500">{customer.email || customer.phone}</p>
                  </div>
                  <Link
                    href="/account"
                    className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/account?tab=orders"
                    className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/account?tab=profile"
                    className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="cursor-pointer rounded-full bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                লগইন
              </Link>
              <Link
                href="/register"
                className="cursor-pointer rounded-full border border-emerald-600 text-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-50 transition-colors hidden sm:inline-block"
              >
                সাইনআপ
              </Link>
            </div>
          )}
        </div>
      </Container>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <input
            className="w-full rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Search products..."
          />
          <button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
            Search
          </button>
        </div>
      </div>
    </header>
  );
}