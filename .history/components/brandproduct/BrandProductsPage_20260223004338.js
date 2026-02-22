"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Container from "@/components/ui/Container";
import { RotateCw } from "lucide-react";
import Link from "next/link";
import { WishlistButton } from "../layout/WishlistButton";
import AddToCartButton from "../cart/AddToCartButton";
import { useParams } from "next/navigation";

/* ===================== helpers ===================== */

function formatBDT(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return "৳ —";
  return `৳ ${num.toLocaleString("en-US")}`;
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

function storageUrl(baseUrl, path) {
  if (!baseUrl || !path) return "";
  return `${baseUrl}/storage/${path}`;
}

function getProductImage(p, baseUrl) {
  if (p?.featured_image) return storageUrl(baseUrl, p.featured_image);

  if (p?.featured_image_url) {
    try {
      const u = new URL(p.featured_image_url);
      return `${baseUrl}${u.pathname}`;
    } catch {
      return p.featured_image_url;
    }
  }
  return "";
}

function getVariantImage(v, baseUrl) {
  if (!v?.image_path) return "";
  return storageUrl(baseUrl, v.image_path);
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

/* ===================== BrandProductsPage ===================== */

export default function BrandProductsPage({ slug, title }) {
  console.log(slug);
  
  const params = useParams(); // ✅
  const slug = useMemo(() => {
    // prop first, then URL param fallback
    const s = slugProp ?? params?.slug;
    return s ? decodeURIComponent(String(s)) : "";
  }, [slugProp, params]);

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://10.211.112.19:8000";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [products, setProducts] = useState([]);

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;
  const TIMEOUT_DURATION = 12000;

  const fetchBrandProducts = useCallback(
    async (isRetryAttempt = false) => {
      if (!baseUrl) {
        setError(
          "NEXT_PUBLIC_API_BASE_URL missing. Restart dev server after setting .env.local"
        );
        setLoading(false);
        return;
      }
      if (!slug) {
        setError("brand slug missing from route params");
        setLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

      try {
        if (isRetryAttempt) setIsRetrying(true);

        setLoading(true);
        setError("");

        const url = `${baseUrl}/api/products/brand/${encodeURIComponent(slug)}`;
        const res = await fetch(url, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        const list =
          (Array.isArray(data) && data) ||
          (Array.isArray(data?.products) && data.products) ||
          (Array.isArray(data?.data) && data.data) ||
          (Array.isArray(data?.data?.products) && data.data.products) ||
          [];

        setProducts(list);
        setRetryCount(0);
        setError("");
      } catch (e) {
        const msg =
          e?.name === "AbortError"
            ? "Request timeout. The server is taking too long to respond."
            : e?.message || "Unknown error";

        setError(msg);
        setProducts([]);

        if (retryCount < MAX_RETRIES) {
          setTimeout(() => setRetryCount((prev) => prev + 1), RETRY_DELAY);
        }
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
        setIsRetrying(false);
      }
    },
    [baseUrl, slug, retryCount]
  );

  useEffect(() => {
    fetchBrandProducts(retryCount > 0);
  }, [fetchBrandProducts, retryCount]);

  const handleManualRetry = () => setRetryCount((prev) => prev + 1);

  const displayProducts = useMemo(() => products, [products]);

  if (error && !products.length && !loading) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <Container className="py-8">
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <div className="text-red-600 mb-4">
              <span className="text-5xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              Failed to Load Products
            </h3>
            <p className="text-sm text-red-600 mb-4">{error}</p>

            <button
              onClick={handleManualRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              <RotateCw
                className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`}
              />
              {isRetrying ? "Retrying..." : "Try Again"}
            </button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-2">
      <Container>
        <div className="flex items-center gap-4 mb-8 mt-8">
          <div className="h-px flex-1 bg-slate-200" />
          <h2 className="text-2xl font-extrabold text-center capitalize">
            {title || slug?.replace(/-/g, " ") || "Special Offer"}
          </h2>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl soft-card overflow-hidden"
              >
                <div className="relative p-5 bg-[#FAF8F6]">
                  <div className="h-44 bg-white/60 rounded-xl animate-pulse" />
                </div>
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
                  <div className="h-6 w-1/3 bg-slate-200 rounded animate-pulse" />
                  <div className="h-10 w-full bg-slate-200 rounded-md animate-pulse" />
                </div>
              </div>
            ))
          ) : !displayProducts.length ? (
            <div className="col-span-4 bg-white border border-gray-300 rounded-2xl p-6 text-sm text-slate-600 text-center">
              No products found.
            </div>
          ) : (
            displayProducts.map((p) => (
              <BrandProductCard key={p.id} p={p} baseUrl={baseUrl} />
            ))
          )}
        </div>

        {/* {products.length > 4 && (
          <div className="flex justify-center mt-8">
            <Link
              href={`/brand/${slug}`}
              className="rounded-full border-2 border-[#008159] text-[#008159] font-extrabold px-8 py-3 hover:bg-[#008159] hover:text-white inline-flex items-center gap-2 transition-colors"
            >
              সব প্রোডাক্ট দেখুন <span>→</span>
            </Link>
          </div>
        )} */}
      </Container>
    </div>
  );
}

/* ===================== Card ===================== */

function BrandProductCard({ p, baseUrl }) {
  const variants = useMemo(() => normalizeVariants(p), [p]);

  const isVariable = useMemo(
    () => isVariableProduct(p, variants),
    [p, variants]
  );

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
      {/* Image block */}
      <div className="relative p-5 bg-[#FAF8F6]">
        <WishlistButton productId={p.id} />

        <Link href={`/product/${p.id}`} className="block">
          <div className="h-44 flex items-center justify-center">
            {imgSrc ? (
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

        {/* Variant overlay at bottom of image on hover */}
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
        <div className="font-bold leading-snug line-clamp-2">{p.name}</div>

        <div className="text-sm text-slate-500 mt-1 line-clamp-2">
          {shortText || `SKU: ${p.sku || "—"}`}
        </div>

        {priceNode}

        {!isVariable ? (
          <div className="text-xs text-slate-500 mt-2">
            Stock:{" "}
            <span className="font-bold text-slate-700">{p.stock ?? "—"}</span>
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

      <div
        className={["mt-2 flex flex-wrap gap-2", compact ? "gap-1.5" : ""].join(
          " "
        )}
      >
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