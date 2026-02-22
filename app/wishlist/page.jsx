"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { Heart, Trash2 } from "lucide-react";
import { useWishlist } from "@/components/hooks/useWishlist";

/** helpers (same as shop page) */
function storageUrl(baseUrl, path) {
  if (!baseUrl || !path) return "";
  return `${baseUrl.replace(/\/$/, "")}/storage/${String(path).replace(/^\//, "")}`;
}

function normalizeApiUrlToBase(baseUrl, maybeUrl) {
  if (!maybeUrl) return "";
  const base = (baseUrl || "").replace(/\/$/, "");
  try {
    const u = new URL(maybeUrl);
    const b = new URL(base);
    return `${b.origin}${u.pathname}${u.search}`;
  } catch {
    return maybeUrl;
  }
}

function getProductImage(p, baseUrl) {
  if (p?.featured_image) return storageUrl(baseUrl, p.featured_image);
  if (p?.featured_image_url) return normalizeApiUrlToBase(baseUrl, p.featured_image_url);
  return "";
}

function pickProducts(data) {
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function toNumber(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function formatBDT(n) {
  if (n === null || n === undefined) return "";
  return `৳ ${Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function getDisplayPrice(p) {
  const sale = toNumber(p?.sale_price);
  const regular = toNumber(p?.regular_price);
  return { sale, regular };
}

export default function WishlistPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://10.211.112.19:8000";

  const { ids, toggle, isWishlisted } = useWishlist();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // fetch all products once (simple approach)
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/products`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = await res.json();
        const list = pickProducts(data);

        if (!alive) return;
        setProducts(list);
      } catch (e) {
        if (e?.name === "AbortError") return;
        console.error(e);
        if (!alive) return;
        setError(e?.message || "Failed to load wishlist products");
        setProducts([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [baseUrl]);

  // wishlist products only
  const wishlistProducts = useMemo(() => {
    // ids are numbers in your API, but localStorage may store as number/string
    const idSet = new Set(ids.map(String));
    return products.filter((p) => idSet.has(String(p?.id)));
  }, [products, ids]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <Container className="py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <Heart className="w-7 h-7 text-rose-600" />
              Wishlist
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              You have <span className="font-bold">{ids.length}</span> item(s) saved.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 text-white font-bold px-5 py-2.5 hover:bg-slate-800 transition"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Error */}
        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonWishlistCard key={i} />
              ))}
            </div>
          ) : ids.length === 0 ? (
            <EmptyWishlist />
          ) : wishlistProducts.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-slate-600">
              Your wishlist has items, but products could not be matched from API.
              <div className="mt-2 text-xs text-slate-500">
                (Maybe product IDs changed or API didn’t return those items.)
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistProducts.map((p) => (
                <WishlistCard
                  key={p.id}
                  p={p}
                  baseUrl={baseUrl}
                  onRemove={() => toggle(p.id)}
                  wishlisted={isWishlisted(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

function WishlistCard({ p, baseUrl, onRemove }) {
  const href = `/product/${p?.id}`;
  const img = getProductImage(p, baseUrl);
  const isVariable = p?.product_type === "variable";
  const { sale, regular } = getDisplayPrice(p);

  return (
    <article className="rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Image */}
      <div className="bg-[#fbf7f2] p-6 relative">
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-5 top-5 h-11 w-11 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-slate-50 transition"
          aria-label="Remove from wishlist"
          title="Remove"
        >
          <Trash2 className="w-5 h-5 text-slate-700" />
        </button>

        <Link href={href} className="block">
          <div className="mx-auto max-w-[230px] bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="aspect-[4/5] flex items-center justify-center">
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt={p?.name || "Product"} className="w-full h-full object-cover" />
              ) : (
                <div className="text-xs text-slate-400">No image</div>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Body */}
      <div className="p-6">
        <Link href={href} className="block">
          <h3 className="text-lg font-extrabold text-slate-900 line-clamp-2">{p?.name}</h3>
        </Link>

        <div className="mt-3 flex items-baseline gap-3">
          {sale !== null ? (
            <>
              <div className="text-lg font-extrabold text-slate-900">{formatBDT(sale)}</div>
              {regular !== null ? (
                <div className="text-sm font-bold text-slate-400 line-through">{formatBDT(regular)}</div>
              ) : null}
            </>
          ) : regular !== null ? (
            <div className="text-lg font-extrabold text-slate-900">{formatBDT(regular)}</div>
          ) : (
            <div className="text-sm font-bold text-slate-400">{isVariable ? "Select options" : "No price"}</div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href={href}
            className="text-center rounded-2xl bg-slate-900 text-white font-bold py-3 hover:bg-slate-800 transition"
          >
            View
          </Link>

          <button
            type="button"
            onClick={onRemove}
            className="rounded-2xl border-2 border-rose-600 bg-white text-rose-600 font-extrabold py-3 hover:bg-rose-50 transition"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

function EmptyWishlist() {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">
        <Heart className="w-7 h-7 text-rose-600" />
      </div>
      <h2 className="mt-4 text-lg font-extrabold text-slate-900">Your wishlist is empty</h2>
      <p className="mt-1 text-sm text-slate-600">
        Browse products and tap the heart icon to save your favorites.
      </p>

      <Link
        href="/shop"
        className="mt-5 inline-flex items-center justify-center rounded-2xl bg-slate-900 text-white font-bold px-6 py-3 hover:bg-slate-800 transition"
      >
        Go to Shop
      </Link>
    </div>
  );
}

function SkeletonWishlistCard() {
  return (
    <article className="rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden animate-pulse">
      <div className="bg-[#fbf7f2] p-6 relative">
        <div className="absolute right-5 top-5 h-11 w-11 rounded-full bg-white border border-gray-200" />
        <div className="mx-auto max-w-[230px] bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="aspect-[4/5] bg-slate-100" />
        </div>
      </div>
      <div className="p-6">
        <div className="h-4 w-40 bg-slate-200 rounded" />
        <div className="mt-3 h-6 w-28 bg-slate-200 rounded" />
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="h-12 bg-slate-200 rounded-2xl" />
          <div className="h-12 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    </article>
  );
}