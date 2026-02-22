"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { Heart, RotateCw } from "lucide-react";
import { useWishlist } from "@/components/hooks/useWishlist";
import { WishlistButton } from "@/components/layout/WishlistButton";
import AddToCartButton from "@/components/cart/AddToCartButton";

/* ===================== helpers (same style as shop/brand cards) ===================== */

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

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

function formatBDT(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return "৳ —";
  return `৳ ${num.toLocaleString("en-US")}`;
}

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

function pickProducts(data) {
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
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

/* ===================== page ===================== */

export default function WishlistPage() {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://10.211.112.19:8000";

  const { ids } = useWishlist();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;
  const TIMEOUT_DURATION = 12000;

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

    async function load() {
      try {
        setLoading(true);
        setIsRetrying(retryCount > 0);
        setError("");

        const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/products`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);

        const data = await res.json();
        const list = pickProducts(data);

        if (!alive) return;
        setProducts(Array.isArray(list) ? list : []);
        setError("");
      } catch (e) {
        if (e?.name === "AbortError") return;

        const msg =
          e?.name === "AbortError"
            ? "Request timeout. The server is taking too long to respond."
            : e?.message || "Failed to load wishlist products";

        if (!alive) return;
        setError(msg);
        setProducts([]);

        if (retryCount < MAX_RETRIES) {
          setTimeout(() => setRetryCount((prev) => prev + 1), RETRY_DELAY);
        }
      } finally {
        clearTimeout(timeoutId);
        if (!alive) return;
        setLoading(false);
        setIsRetrying(false);
      }
    }

    load();

    return () => {
      alive = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [baseUrl, retryCount]);

  const wishlistProducts = useMemo(() => {
    const idSet = new Set(ids.map(String));
    return products.filter((p) => idSet.has(String(p?.id)));
  }, [products, ids]);

  const handleManualRetry = () => setRetryCount((prev) => prev + 1);

  return (
    <div className="bg-slate-50 min-h-screen py-2">
      <Container>
        {/* Title with lines (same as brand/shop header) */}
        <div className="flex items-center gap-4 mb-8 mt-8">
          <div className="h-px flex-1 bg-slate-200" />
          <h2 className="text-2xl font-extrabold text-center flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-600" />
            Wishlist
            <span className="text-sm font-bold text-slate-500">
              ({ids.length})
            </span>
          </h2>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Error block like brand page */}
        {error && !loading ? (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⚠️</span>
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
            <button
              onClick={handleManualRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition disabled:opacity-50"
            >
              <RotateCw className={`w-3 h-3 ${isRetrying ? "animate-spin" : ""}`} />
              Retry
            </button>
          </div>
        ) : null}

        {/* Empty state */}
        {!loading && ids.length === 0 ? (
          <div className="bg-white border border-gray-300 rounded-2xl p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
              <Heart className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="mt-3 text-lg font-extrabold text-slate-900">
              Your wishlist is empty
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Browse products and tap the heart icon to save your favorites.
            </p>
            <Link
              href="/shop"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#008159] text-white font-extrabold px-6 py-3 hover:opacity-90 transition"
            >
              Go to Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            ) : !wishlistProducts.length ? (
              <div className="col-span-full bg-white border border-gray-300 rounded-2xl p-6 text-sm text-slate-600 text-center">
                Wishlist items found, but products couldn’t be matched from API.
              </div>
            ) : (
              wishlistProducts.map((p) => (
                <WishlistProductCard key={p.id} p={p} baseUrl={baseUrl} />
              ))
            )}
          </div>
        )}
      </Container>
    </div>
  );
}

/* ===================== Card (same style as brand/shop) ===================== */

function WishlistProductCard({ p, baseUrl }) {
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

  const imgSrc = getProductImage(p, baseUrl);
  const shortText = stripHtml(p.short_description) || stripHtml(p.description);

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
      {/* Image */}
      <div className="relative p-5 bg-[#FAF8F6]">
        {/* Heart toggle (same as other pages) */}
        <WishlistButton productId={p.id} />

        <Link href={`/product/${p.id}`} className="block">
          <div className="h-44 flex items-center justify-center">
            {imgSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imgSrc}
                alt={p.name}
                className="object-contain w-[170px] h-[170px] rounded-xl"
                loading="lazy"
              />
            ) : (
              <div className="text-xs text-slate-500">No image</div>
            )}
          </div>
        </Link>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/product/${p.id}`} className="hover:underline">
          <div className="font-bold leading-snug line-clamp-2">{p.name}</div>
        </Link>

        <div className="text-sm text-slate-500 mt-1 line-clamp-2">
          {shortText || `SKU: ${p.sku || "—"}`}
        </div>

        {priceNode}

        {/* AddToCart like shop/brand */}
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

/* ===================== Skeleton ===================== */

function SkeletonCard() {
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