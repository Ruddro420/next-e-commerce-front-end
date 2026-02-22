"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { Heart } from "lucide-react";
import { WishlistButton } from "../layout/WishlistButton";

/**
 * ✅ API
 * GET {BASE_URL}/api/products
 * -> { success: true, products: [...] }
 *
 * ✅ Wishlist
 * localStorage key: "wishlist_product_ids" (array of product ids)
 */

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

function stripHtml(html) {
  if (!html) return "";
  return String(html)
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<\/?[^>]+(>|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clampText(s, max = 80) {
  if (!s) return "";
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trim() + "…";
}

function getDisplayPrice(p) {
  const sale = toNumber(p?.sale_price);
  const regular = toNumber(p?.regular_price);
  return { sale, regular };
}

function uniqueSorted(arr) {
  return Array.from(new Set(arr.filter(Boolean))).sort((a, b) =>
    String(a).localeCompare(String(b))
  );
}

function useWishlist() {
  const KEY = "wishlist_product_ids";
  const [ids, setIds] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setIds(Array.isArray(parsed) ? parsed : []);
    } catch {
      setIds([]);
    }
  }, []);

  const isWishlisted = (id) => ids.includes(id);

  const toggle = (id) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return { ids, isWishlisted, toggle };
}

export default function ShopPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://10.211.112.19:8000";

  const [products, setProducts] = useState([]);

  // UI state
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");

  // Filters
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all"); // simple | variable | all
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Loading / error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const wishlist = useWishlist();

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
        setError(e?.message || "Failed to load products");
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

  const categories = useMemo(() => {
    const list = products.map((p) => p?.category?.name).filter(Boolean);
    return uniqueSorted(list);
  }, [products]);

  const types = useMemo(() => {
    const list = products.map((p) => p?.product_type).filter(Boolean);
    return uniqueSorted(list);
  }, [products]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const min = minPrice === "" ? null : toNumber(minPrice);
    const max = maxPrice === "" ? null : toNumber(maxPrice);

    let list = products.filter((p) => {
      const name = (p?.name || "").toLowerCase();
      const sku = (p?.sku || "").toLowerCase();
      if (query && !name.includes(query) && !sku.includes(query)) return false;

      if (category !== "all") {
        const c = p?.category?.name || "";
        if (c !== category) return false;
      }

      if (type !== "all") {
        if ((p?.product_type || "") !== type) return false;
      }

      if (inStockOnly) {
        const s = toNumber(p?.stock);
        if (s === null || s <= 0) return false;
      }

      const { sale, regular } = getDisplayPrice(p);
      const effective = sale ?? regular;

      if ((min !== null || max !== null) && effective === null) return false;
      if (min !== null && effective !== null && effective < min) return false;
      if (max !== null && effective !== null && effective > max) return false;

      return true;
    });

    if (sort === "price_low") {
      list = [...list].sort((a, b) => {
        const pa = getDisplayPrice(a).sale ?? getDisplayPrice(a).regular ?? Number.POSITIVE_INFINITY;
        const pb = getDisplayPrice(b).sale ?? getDisplayPrice(b).regular ?? Number.POSITIVE_INFINITY;
        return pa - pb;
      });
    } else if (sort === "price_high") {
      list = [...list].sort((a, b) => {
        const pa = getDisplayPrice(a).sale ?? getDisplayPrice(a).regular ?? -1;
        const pb = getDisplayPrice(b).sale ?? getDisplayPrice(b).regular ?? -1;
        return pb - pa;
      });
    } else if (sort === "name_az") {
      list = [...list].sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
    } else if (sort === "name_za") {
      list = [...list].sort((a, b) => String(b?.name || "").localeCompare(String(a?.name || "")));
    } else {
      list = [...list].sort((a, b) => {
        const da = a?.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b?.created_at ? new Date(b.created_at).getTime() : 0;
        return db - da;
      });
    }

    return list;
  }, [products, q, category, type, minPrice, maxPrice, inStockOnly, sort]);

  useEffect(() => setPage(1), [q, category, type, minPrice, maxPrice, inStockOnly, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const add = (n) => pages.push(n);

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) add(i);
      return pages;
    }

    add(1);
    if (safePage > 3) pages.push("…");
    const from = Math.max(2, safePage - 1);
    const to = Math.min(totalPages - 1, safePage + 1);
    for (let i = from; i <= to; i++) add(i);
    if (safePage < totalPages - 2) pages.push("…");
    add(totalPages);
    return pages;
  }, [safePage, totalPages]);

  const clearFilters = () => {
    setQ("");
    setSort("newest");
    setCategory("all");
    setType("all");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Container className="py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Shop</h1>
            <p className="text-sm text-slate-600 mt-1">
              Browse products with filters, wishlist, and clean cards.
            </p>
          </div>

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search (name / sku)..."
              className="w-full sm:w-72 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="name_az">Name: A → Z</option>
              <option value="name_za">Name: Z → A</option>
            </select>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-end gap-3">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
              <div>
                <div className="text-xs font-bold text-slate-600 mb-1">Category</div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="all">All</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-600 mb-1">Type</div>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="all">All</option>
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t === "variable" ? "Variable" : t === "simple" ? "Simple" : t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-600 mb-1">Min price</div>
                <input
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 50"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <div className="text-xs font-bold text-slate-600 mb-1">Max price</div>
                <input
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 500"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="h-4 w-4 accent-emerald-600"
                />
                In stock only
              </label>

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-gray-300 bg-white hover:bg-slate-50 font-bold px-4 py-2.5 text-sm"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
            <span>{loading ? "Loading products..." : `${filtered.length} products found`}</span>
            <span>Wishlist: {wishlist.ids.length}</span>
          </div>
        </div>

        {/* Error */}
        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {/* Cards grid (structure like your screenshot) */}
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonProductCard key={i} />)
            : paged.map((p) => (
                <ProductCard
                  key={p.id}
                  p={p}
                  baseUrl={baseUrl}
                  wishlisted={wishlist.isWishlisted(p.id)}
                  onToggleWishlist={() => wishlist.toggle(p.id)}
                />
              ))}
        </div>

        {!loading && !error && filtered.length === 0 ? (
          <div className="mt-8 text-center text-sm text-slate-500">
            No products match your filters.
          </div>
        ) : null}

        {/* Pagination */}
        {!loading && !error && filtered.length > 0 ? (
          <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>

            {pageNumbers.map((n, idx) =>
              n === "…" ? (
                <span key={`dots-${idx}`} className="px-2 text-slate-500">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 ${
                    n === safePage ? "bg-slate-900 text-white" : "bg-white"
                  }`}
                >
                  {n}
                </button>
              )
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        ) : null}
      </Container>
    </div>
  );
}

/**
 * Card structure matches your screenshot:
 * - Big image area
 * - Wishlist heart on top-right
 * - Name + short description
 * - Price (sale + strike)
 * - Variable: "Size" chips
 * - Stock line (simple)
 * - Big green outline "কার্ট যুক্ত করুন" button with cart icon
 */
function ProductCard({ p, baseUrl, wishlisted, onToggleWishlist }) {
  const href = `/product/${p?.id}`;
  const img = getProductImage(p, baseUrl);

  const isVariable = p?.product_type === "variable";
  const { sale, regular } = getDisplayPrice(p);

  const desc = clampText(stripHtml(p?.short_description || p?.description || ""), 15);
  const stock = toNumber(p?.stock);

  // Your API doesn't include variation options in this response,
  // so we show a clean placeholder size selector for variable products.
  const sizeOptions = ["S", "M", "L", "XL"];
  const [size, setSize] = useState(sizeOptions[0]);

  return (
    <article className="rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Top image area */}
      <div className="bg-[#fbf7f2] relative">
        {/* Whishlist */}
        <WishlistButton productId={p.id} />

        <Link href={href} className="block">
          <div className="mx-auto max-w-full bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="aspect-[4/5] flex items-center justify-center">
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt={p?.name || "Product"} className="w-full h-full object-contain" />
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
          <h3 className="text-xl font-extrabold text-slate-900">{p?.name}</h3>
        </Link>

        {/* <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          {desc || "—"}
        </p> */}

        {/* Price */}
        <div className="mt-4 flex items-baseline gap-3">
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

        {/* Variable: size selector */}
        {isVariable ? (
          <div className="mt-5">
            <div className="text-sm font-bold text-slate-700">Size:</div>
            <div className="mt-3 flex flex-wrap gap-3">
              {sizeOptions.map((opt) => {
                const active = opt === size;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSize(opt)}
                    className={`h-11 min-w-11 px-4 rounded-xl border font-extrabold transition ${
                      active
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-900 border-gray-300 hover:bg-slate-50"
                    }`}
                    aria-pressed={active}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-5 text-sm text-slate-600">
            {/* <span className="text-slate-500">Stock:</span>{" "}
            <span className="font-extrabold">{stock ?? "—"}</span> */}
          </div>
        )}

        {/* Add to cart button */}
        <button
          type="button"
          className="mt-2 w-full rounded-md border-2 border-emerald-700 bg-white text-emerald-700 font-extrabold py-2 hover:bg-emerald-50 transition flex items-center justify-center gap-3"
        >
          <CartIcon />
          কার্ট যুক্ত করুন
        </button>
      </div>
    </article>
  );
}

/* ---------- Icons ---------- */

function HeartIcon({ filled }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      xmlns="http://www.w3.org/2000/svg"
      className={filled ? "text-rose-600" : "text-slate-800"}
    >
      <path
        d="M12 21s-7-4.35-9.33-8.34C.46 8.96 2.13 6 5.5 6c1.74 0 3.41.93 4.5 2.09C11.09 6.93 12.76 6 14.5 6c3.37 0 5.04 2.96 2.83 6.66C19 16.65 12 21 12 21z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-emerald-700"
    >
      <path
        d="M6.5 6h15l-1.5 8.5H8L6.5 6z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 6 5.7 3.8H3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="9" cy="19" r="1.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="19" r="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

/* ---------- Skeleton ---------- */

function SkeletonProductCard() {
  return (
    <article className="rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden animate-pulse">
      <div className="bg-[#fbf7f2] relative">
        <div className="absolute right-5 top-5 h-11 w-11 rounded-full bg-white border border-gray-200" />
        <div className="mx-auto max-w-[230px] bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="aspect-[4/5] bg-slate-100" />
        </div>
      </div>
      <div className="p-6">
        <div className="h-5 w-32 bg-slate-200 rounded" />
        <div className="mt-3 h-4 w-full bg-slate-200 rounded" />
        <div className="mt-2 h-4 w-5/6 bg-slate-200 rounded" />
        <div className="mt-4 h-5 w-24 bg-slate-200 rounded" />
        <div className="mt-5 h-10 w-40 bg-slate-200 rounded-xl" />
        <div className="mt-6 h-12 w-full bg-slate-200 rounded-2xl" />
      </div>
    </article>
  );
}