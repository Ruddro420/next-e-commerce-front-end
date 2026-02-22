"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { RotateCw } from "lucide-react";
import { WishlistButton } from "../layout/WishlistButton";
import AddToCartButton from "../cart/AddToCartButton";

/**
 * ✅ API
 * GET {BASE_URL}/api/products
 * -> { success: true, products: [...] }
 *
 * ✅ Wishlist
 * localStorage key: "wishlist_product_ids" (array of product ids)
 */

/* ===================== helpers ===================== */

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

function getVariantImage(v, baseUrl) {
  if (!v?.image_path) return "";
  return storageUrl(baseUrl, v.image_path);
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
  if (n === null || n === undefined) return "৳ —";
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

function uniqueSorted(arr) {
  return Array.from(new Set(arr.filter(Boolean))).sort((a, b) =>
    String(a).localeCompare(String(b))
  );
}

function getDisplayPrice(p) {
  const sale = toNumber(p?.sale_price);
  const regular = toNumber(p?.regular_price);
  return { sale, regular };
}

// ---------- Variant helpers (same style as BrandProductsPage) ----------

function pickPrice(obj) {
  if (!obj) return null;
  const keys = [
    "sale_price",
    "discount_price",
    "discounted_price",
    "special_price",
    "current_price",
    "price",
    "regular_price",
    "base_price",
  ];
  for (const k of keys) {
    const val = obj?.[k];
    if (val != null && val !== "") {
      const n = Number(val);
      if (!Number.isNaN(n)) return n;
    }
  }
  return null;
}

function pickOldPrice(obj) {
  if (!obj) return null;
  const sale =
    obj?.sale_price != null && obj?.sale_price !== ""
      ? Number(obj.sale_price)
      : null;
  const regular =
    obj?.regular_price != null && obj?.regular_price !== ""
      ? Number(obj.regular_price)
      : null;

  if (
    sale != null &&
    regular != null &&
    !Number.isNaN(sale) &&
    !Number.isNaN(regular) &&
    sale < regular
  ) {
    return regular;
  }
  return null;
}

function normalizeVariants(p) {
  const candidates = [
    p?.variants,
    p?.variations,
    p?.product_variants,
    p?.children,
    p?.variant_items,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
    if (Array.isArray(c?.data)) return c.data;
    if (Array.isArray(c?.variants)) return c.variants;
    if (Array.isArray(c?.items)) return c.items;
  }
  return [];
}

function isVariableProduct(p, variants) {
  const t = String(p?.product_type ?? p?.type ?? "").toLowerCase();
  if (variants.length > 0) return true;
  if (t === "variable") return true;
  if (t === "variation") return true;
  if (t.includes("variable")) return true;
  if (p?.product_type_id === 2) return true;
  return false;
}

/* ===================== wishlist hook ===================== */

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

/* ===================== ShopPage ===================== */

export default function ShopPage() {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://10.211.112.19:8000";

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
        const pa =
          getDisplayPrice(a).sale ??
          getDisplayPrice(a).regular ??
          Number.POSITIVE_INFINITY;
        const pb =
          getDisplayPrice(b).sale ??
          getDisplayPrice(b).regular ??
          Number.POSITIVE_INFINITY;
        return pa - pb;
      });
    } else if (sort === "price_high") {
      list = [...list].sort((a, b) => {
        const pa = getDisplayPrice(a).sale ?? getDisplayPrice(a).regular ?? -1;
        const pb = getDisplayPrice(b).sale ?? getDisplayPrice(b).regular ?? -1;
        return pb - pa;
      });
    } else if (sort === "name_az") {
      list = [...list].sort((a, b) =>
        String(a?.name || "").localeCompare(String(b?.name || ""))
      );
    } else if (sort === "name_za") {
      list = [...list].sort((a, b) =>
        String(b?.name || "").localeCompare(String(a?.name || ""))
      );
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
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Shop
            </h1>
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

        {/* Cards grid (NOW same design as BrandProductCard) */}
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonBrandCard key={i} />)
            : paged.map((p) => (
                <BrandStyleProductCard key={p.id} p={p} baseUrl={baseUrl} />
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

/* ===================== Brand-style Product Card ===================== */

function BrandStyleProductCard({ p, baseUrl }) {
  const variants = useMemo(() => normalizeVariants(p), [p]);
  const isVariable = useMemo(() => isVariableProduct(p, variants), [p, variants]);

  const [selectedVariantId, setSelectedVariantId] = useState(() =>
    isVariable && variants.length ? variants[0].id : null
  );

  useEffect(() => {
    if (!isVariable) return;
    if (!variants.length) {
      setSelectedVariantId(null);
      return;
    }
    setSelectedVariantId((prev) =>
      variants.some((v) => v.id === prev) ? prev : variants[0].id
    );
  }, [isVariable, variants]);

  const selectedVariant = useMemo(() => {
    if (!isVariable) return null;
    return variants.find((v) => v.id === selectedVariantId) || variants[0] || null;
  }, [isVariable, variants, selectedVariantId]);

  const imgSrc =
    isVariable && selectedVariant?.image_path
      ? getVariantImage(selectedVariant, baseUrl)
      : getProductImage(p, baseUrl);

  const shortText =
    stripHtml(p?.short_description) || stripHtml(p?.description) || "";

  const priceNode = useMemo(() => {
    const obj = isVariable ? selectedVariant : p;
    const value = pickPrice(obj);
    const old = pickOldPrice(obj);

    return (
      <div className="mt-2 font-extrabold">
        {value == null ? "৳ —" : formatBDT(value)}
        {old != null && value != null && value < old ? (
          <span className="ml-2 text-sm text-slate-500 line-through">
            {formatBDT(old)}
          </span>
        ) : null}
      </div>
    );
  }, [isVariable, p, selectedVariant]);

  return (
    <div className="group relative bg-white rounded-2xl soft-card overflow-hidden h-full flex flex-col isolate">
      {/* Image block */}
      <div className="relative p-5 bg-[#FAF8F6]">
        <WishlistButton productId={p.id} />

        <Link href={`/product/${p.id}`} className="block">
          <div className="h-44 flex items-center justify-center">
            {imgSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imgSrc}
                alt={p?.name || "Product"}
                className="object-contain w-[170px] h-[170px] rounded-xl"
                loading="lazy"
              />
            ) : (
              <div className="text-xs text-slate-500">No image</div>
            )}
          </div>
        </Link>

        {/* Variant overlay at bottom of image on hover (only if variants exist) */}
        {isVariable && variants.length ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 px-3 pb-3">
            <div className="pointer-events-auto opacity-0 translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
              <div className="rounded-xl border border-gray-200 bg-white/95 backdrop-blur p-2 shadow-sm">
                <VariantRow
                  variants={variants}
                  selectedVariantId={selectedVariantId}
                  setSelectedVariantId={setSelectedVariantId}
                  compact
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="font-bold leading-snug line-clamp-2">{p?.name}</div>

        <div className="text-sm text-slate-500 mt-1 line-clamp-2">
          {shortText || `SKU: ${p?.sku || "—"}`}
        </div>

        {priceNode}

        {!isVariable ? (
          <div className="text-xs text-slate-500 mt-2">
            {/* Stock:{" "}
            <span className="font-bold text-slate-700">
              {p?.stock ?? "—"}
            </span> */}
          </div>
        ) : (
          <div className="text-[11px] text-slate-500 mt-2">
            Hover image to choose variant
          </div>
        )}

        {/* ✅ Global button: Add -> View cart */}
        <AddToCartButton
          p={p}
          isVariable={isVariable}
          selectedVariant={selectedVariant}
          baseUrl={baseUrl}
          getProductImage={getProductImage}
          className="mt-4"
          labels={{
            add: "কার্টে যুক্ত করুন",
            view: "কার্ট দেখুন",
            addedToast: "Added to cart",
          }}
        />
      </div>
    </div>
  );
}

function VariantRow({
  variants,
  selectedVariantId,
  setSelectedVariantId,
  compact = false,
}) {
  const mainKey = useMemo(() => {
    const attrs =
      variants?.[0]?.attributes || variants?.[0]?.attribute_values || {};
    const keys = Object.keys(attrs);
    return keys[0] || null;
  }, [variants]);

  return (
    <div>
      <div className="text-[11px] text-slate-700 font-extrabold">
        {mainKey ? `${mainKey}:` : "Variant:"}
      </div>

      <div className={["mt-2 flex flex-wrap gap-2", compact ? "gap-1.5" : ""].join(" ")}>
        {variants.map((v) => {
          const attrs = v?.attributes || v?.attribute_values || {};
          const label = mainKey ? attrs?.[mainKey] : `#${v.id}`;
          const active = v.id === selectedVariantId;

          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedVariantId(v.id)}
              className={[
                compact
                  ? "px-2 py-1 text-[11px] rounded-lg"
                  : "px-3 py-1.5 text-xs rounded-lg",
                "border font-extrabold transition",
                active
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white hover:bg-slate-50 border-gray-300 text-slate-800",
              ].join(" ")}
            >
              {label || `#${v.id}`}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ===================== Skeleton (Brand style) ===================== */

function SkeletonBrandCard() {
  return (
    <div className="bg-white rounded-2xl soft-card overflow-hidden animate-pulse">
      <div className="relative p-5 bg-[#FAF8F6]">
        <div className="h-44 bg-white/60 rounded-xl" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 bg-slate-200 rounded" />
        <div className="h-4 w-1/2 bg-slate-200 rounded" />
        <div className="h-6 w-1/3 bg-slate-200 rounded" />
        <div className="h-10 w-full bg-slate-200 rounded-md" />
      </div>
    </div>
  );
}