"use client";

import Container from "@/components/ui/Container";
import { ShoppingCart, User } from "lucide-react";
import { useMemo, useEffect, useState, useCallback } from "react";
import { useCart } from "@/store/cartStore";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import ProductSearchBar from "./ProductSearchBar";
import HeaderWishlistButton from "./HeaderWishlistButton";

/* eslint-disable @next/next/no-html-link-for-pages */

// Loading Skeleton Component
function HeaderSkeleton() {
  return (
    <header className="bg-white border-b border-gray-200">
      <Container className="py-3 flex items-center gap-3">
        {/* Logo Skeleton */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gray-200 animate-pulse" />
          <div className="leading-tight">
            <div className="w-24 h-5 bg-gray-200 rounded animate-pulse mb-1" />
            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Search Skeleton (desktop) */}
        <div className="flex-1 hidden md:flex items-center gap-2">
          <div className="flex-1 relative">
            <div className="w-full h-10 rounded-full bg-gray-200 animate-pulse" />
          </div>
        </div>

        {/* Actions Skeleton */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden lg:block w-24 h-10 rounded-full bg-gray-200 animate-pulse" />
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          <div className="w-24 h-10 rounded-full bg-gray-200 animate-pulse" />
        </div>
      </Container>

      {/* Mobile Search Skeleton */}
      <div className="md:hidden px-4 pb-3">
        <div className="w-full h-10 rounded-full bg-gray-200 animate-pulse" />
      </div>
    </header>
  );
}

type GeneralSettingsResponse = {
  success: boolean;
  data: {
    software_name: string | null;
    software_tagline: string | null;
    city: string | null;
    country: string | null;
    logo_url: string | null;
    // keep extra fields if needed
    [key: string]: any;
  };
};

// Main Header Component
export default function Header() {
  const { items } = useCart();
  const { customer, loading, logout } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // settings from your public API
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settings, setSettings] = useState<GeneralSettingsResponse["data"] | null>(null);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = useMemo(() => {
    return items.reduce((sum, it) => sum + (it.qty ?? 1), 0);
  }, [items]);

  const handleLogout = async () => {
    try {
      await logout();
      setDropdownOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(".user-menu")) setDropdownOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      setSettingsLoading(true);
      const res = await fetch("/api/settings/general", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) throw new Error(`Settings request failed: ${res.status}`);

      const json = (await res.json()) as GeneralSettingsResponse;
      setSettings(json?.data ?? null);
    } catch (e) {
      console.error("Failed to load general settings:", e);
      setSettings(null);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchSettings();
  }, [mounted, fetchSettings]);

  // Show skeleton while loading or not mounted (include settings loading)
  if (!mounted || loading || settingsLoading) {
    return <HeaderSkeleton />;
  }

  const siteName = settings?.software_name || "ShopBangla";
  const locationText = (() => {
    const city = settings?.city?.trim();
    const country = settings?.country?.trim();
    if (city && country) return `${country} • ${city}`;
    if (city) return city;
    if (country) return country;
    return "BD • ঢাকা";
  })();

  const logoUrl = settings?.logo_url;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <Container className="py-3 flex items-center gap-3">
        {/* Logo (link) */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={siteName}
              className="w-9 h-9 rounded-xl object-cover border border-gray-200 bg-white"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 transition-colors" />
          )}

          <div className="leading-tight">
            <div className="font-extrabold text-lg">{siteName}</div>
            <div className="text-xs text-slate-500">{locationText}</div>
          </div>
        </Link>

        {/* Search (desktop) */}
        <ProductSearchBar />

        {/* Actions */}
        <div className="flex items-center gap-3 ml-auto">
          <Link
            href="/brand/special-offer"
            className="hidden lg:inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
          >
            🎁 <span>বিশেষ অফার</span>
          </Link>

          {/* Wishlist should be a link */}
          <Link
            href="/account?tab=wishlist"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            aria-label="Wishlist"
          >
            <HeaderWishlistButton />
          </Link>

          {/* Cart should be Link */}
          <Link
            href="/cart"
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            aria-label="Go to cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 ? (
              <span className="absolute -top-2 -right-2 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Link>

          {/* Conditional Auth Button */}
          {customer ? (
            <div className="relative user-menu">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {customer.name?.split(" ")[0] || "Account"}
                </span>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 animate-fadeIn">
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold">{customer.name}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {customer.email || customer.phone}
                      </p>
                    </div>

                    <Link
                      href="/account"
                      className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="flex items-center gap-2">
                        <span>📊</span> Dashboard
                      </span>
                    </Link>

                    <Link
                      href="/account?tab=orders"
                      className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="flex items-center gap-2">
                        <span>📦</span> My Orders
                      </span>
                    </Link>

                    <Link
                      href="/account?tab=profile"
                      className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="flex items-center gap-2">
                        <span>👤</span> Profile Settings
                      </span>
                    </Link>

                    <Link
                      href="/account?tab=wishlist"
                      className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="flex items-center gap-2">
                        <span>❤️</span> Wishlist
                      </span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                    >
                      <span className="flex items-center gap-2">
                        <span>🚪</span> Logout
                      </span>
                    </button>
                  </div>
                </div>
              )}
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
            className="w-full rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
            placeholder="পণ্য সার্চ করুন..."
          />
          <button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors">
            খুঁজুন
          </button>
        </div>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </header>
  );
}