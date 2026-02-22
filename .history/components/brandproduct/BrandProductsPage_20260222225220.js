"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Container from "@/components/ui/Container";
import { ShoppingCart, RotateCw } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/store/cartStore";
import { WishlistButton } from "../layout/WishlistButton";

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

  // fallback: swap hostname if API returns localhost
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

function priceForSimple(p) {
  const sale = p?.sale_price != null ? Number(p.sale_price) : null;
  const regular = p?.regular_price != null ? Number(p.regular_price) : null;
  const fallback = p?.price != null ? Number(p.price) : null;

  if (sale != null && !Number.isNaN(sale)) return { value: sale, regular };
  if (regular != null && !Number.isNaN(regular))
    return { value: regular, regular: null };
  if (fallback != null && !Number.isNaN(fallback))
    return { value: fallback, regular: null };

  return { value: null, regular: null };
}

function priceForVariant(v) {
  const sale = v?.sale_price != null ? Number(v.sale_price) : null;
  const regular = v?.regular_price != null ? Number(v.regular_price) : null;
  const fallback = v?.price != null ? Number(v.price) : null;

  if (sale != null && !Number.isNaN(sale)) return { value: sale, regular };
  if (regular != null && !Number.isNaN(regular))
    return { value: regular, regular: null };
  if (fallback != null && !Number.isNaN(fallback))
    return { value: fallback, regular: null };

  return { value: null, regular: null };
}

function normalizeVariants(product) {
  // supports: variants: [] OR variants: { data: [] } OR variations: []
  if (Array.isArray(product?.variants)) return product.variants;
  if (Array.isArray(product?.variants?.data)) return product.variants.data;
  if (Array.isArray(product?.variations)) return product.variations;
  if (Array.isArray(product?.variations?.data)) return product.variations.data;
  return [];
}

function isVariableProduct(product, variants) {
  const t = String(product?.product_type || "").toLowerCase();
  // if variants exist, treat as variable even if product_type is wrong/missing
  return variants.length > 0 || t === "variable" || t === "variation" || t.includes("variable");
}

function rangeForVariable(product, variants) {
  const vals = (variants || [])
    .map((v) => priceForVariant(v).value)
    .filter((x) => x != null);

  if (!vals.length) return { min: null, max: null };
  return { min: Math.min(...vals), max: Math.max(...vals) };
}

/* ===================== Special Offer Page ===================== */

export default function BrandProductsPage({ slug = "special-offer", title }) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://10.211.112.19:8000";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [products, setProducts] = useState([]);
  const [showAddedFeedback, setShowAddedFeedback] = useState({}); // Track which product was added

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

        if (!res.ok)
          throw new Error(`API error: ${res.status} ${res.statusText}`);

        const data = await res.json();

        // API might return { products: [] } OR [] directly — handle both
        const list = Array.isArray(data) ? data : data?.products;

        setProducts(Array.isArray(list) ? list : []);

        setRetryCount(0);
        setError("");
      } catch (e) {
        const errorMessage =
          e?.name === "AbortError"
            ? "Request timeout. The server is taking too long to respond."
            : e?.message || "Unknown error";

        setError(errorMessage);
        setProducts([]);

        if (retryCount < MAX_RETRIES) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, RETRY_DELAY);
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

  const handleManualRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  // Take only first 4 products
  const displayProducts = useMemo(() => products.slice(0, 4), [products]);

  const handleAddToCart = (e, product, selectedVariant = null, isVariable = false) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    const v = isVariable ? selectedVariant : null;

    const price = isVariable
      ? (v?.sale_price ?? v?.regular_price ?? v?.price)
      : (product?.sale_price ?? product?.regular_price ?? product?.price);

    const oldPrice = isVariable
      ? (v?.regular_price && v?.sale_price ? v.regular_price : null)
      : (product?.regular_price && product?.sale_price ? product.regular_price : null);

    const variantLabel = isVariable
      ? (() => {
          const attrs = v?.attributes || {};
          const keys = Object.keys(attrs);
          if (!keys.length) return `Variant #${v?.id}`;
          return keys.map((k) => `${k}: ${attrs[k]}`).join(", ");
        })()
      : (product?.variant ?? "");

    const image =
      (isVariable && v?.image_path ? `${baseUrl}/storage/${v.image_path}` : "") ||
      getProductImage(product, baseUrl) ||
      "";

    const { addItem } = useCart.getState();

    addItem(
      {
        productId: product.id,
        variantId: v?.id ?? null,
        name: product.name,
        category: product?.category?.name || product?.category?.slug || "",
        variantLabel,
        image,
        price,
        oldPrice,
        stock: isVariable ? v?.stock : product?.stock,
        attrs: isVariable ? v?.attributes || null : null,
      },
      1
    );

    setShowAddedFeedback((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setShowAddedFeedback((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

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

            <div className="space-y-3">
              <button
                onClick={handleManualRetry}
                disabled={isRetrying}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                <RotateCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
                {isRetrying ? "Retrying..." : "Try Again"}
              </button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <Container>
        {/* Title with lines */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-slate-200" />
          <h2 className="text-2xl font-extrabold text-center capitalize">
            {title || slug?.replace(/-/g, " ") || "Special Offer"}
          </h2>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {error && products.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⚠️</span>
              <p className="text-sm text-yellow-700">
                Some products couldn't be loaded completely. {error}
              </p>
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
        )}

        {/* Products Grid - Exactly 4 in a row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl soft-card overflow-hidden">
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
            displayProducts.map((product) => (
              <BrandProductCard
                key={product.id}
                p={product}
                baseUrl={baseUrl}
                showAddedFeedback={showAddedFeedback[product.id]}
                onAddToCart={handleAddToCart}
              />
            ))
          )}
        </div>

        {/* View All Button */}
        {products.length > 4 && (
          <div className="flex justify-center mt-8">
            <Link
              href={`/brand/${slug}`}
              className="rounded-full border-2 border-[#008159] text-[#008159] font-extrabold px-8 py-3 hover:bg-[#008159] hover:text-white inline-flex items-center gap-2 transition-colors"
            >
              সব প্রোডাক্ট দেখুন <span>→</span>
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
}

/* ===================== Product Card ===================== */

function BrandProductCard({ p, baseUrl, showAddedFeedback, onAddToCart }) {
  const variants = useMemo(() => normalizeVariants(p), [p]);
  const isVariable = useMemo(() => isVariableProduct(p, variants), [p, variants]);

  const [selectedVariantId, setSelectedVariantId] = useState(() =>
    isVariable && variants.length ? variants[0].id : null
  );

  // keep selectedVariant valid when variants load/change
  useEffect(() => {
    if (!isVariable) return;
    if (!variants.length) {
      setSelectedVariantId(null);
      return;
    }
    setSelectedVariantId((prev) => (variants.some((v) => v.id === prev) ? prev : variants[0].id));
  }, [isVariable, variants]);

  const selectedVariant = useMemo(() => {
    if (!isVariable) return null;
    return variants.find((v) => v.id === selectedVariantId) || null;
  }, [isVariable, variants, selectedVariantId]);

  const imgSrc =
    isVariable && selectedVariant?.image_path
      ? getVariantImage(selectedVariant, baseUrl)
      : getProductImage(p, baseUrl);

  const shortText = stripHtml(p.short_description) || stripHtml(p.description);

  const priceNode = useMemo(() => {
    if (!isVariable) {
      const pr = priceForSimple(p);
      return (
        <div className="mt-2 font-extrabold">
          {pr.value == null ? "৳ —" : formatBDT(pr.value)}
          {pr.regular != null && pr.value != null && pr.value < pr.regular ? (
            <span className="ml-2 text-sm text-slate-500 line-through">
              {formatBDT(pr.regular)}
            </span>
          ) : null}
        </div>
      );
    }

    if (selectedVariant) {
      const pr = priceForVariant(selectedVariant);
      return (
        <div className="mt-2 font-extrabold">
          {pr.value == null ? "৳ —" : formatBDT(pr.value)}
          {pr.regular != null && pr.value != null && pr.value < pr.regular ? (
            <span className="ml-2 text-sm text-slate-500 line-through">
              {formatBDT(pr.regular)}
            </span>
          ) : null}
        </div>
      );
    }

    const rg = rangeForVariable(p, variants);
    return (
      <div className="mt-2 font-extrabold">
        {rg.min == null ? "৳ —" : `${formatBDT(rg.min)} - ${formatBDT(rg.max)}`}
      </div>
    );
  }, [isVariable, p, selectedVariant, variants]);

  return (
    <div className="bg-white rounded-2xl soft-card overflow-hidden h-full flex flex-col">
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
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="font-bold leading-snug line-clamp-2">{p.name}</div>

        <div className="text-sm text-slate-500 mt-1 line-clamp-2">
          {shortText || `SKU: ${p.sku || "—"}`}
        </div>

        {priceNode}

        {isVariable && p.variants.length ? (
          <VariantRow
            variants={p.variants}
            selectedVariantId={selectedVariantId}
            setSelectedVariantId={setSelectedVariantId}
          />
        ) : (
          <div className="text-xs text-slate-500 mt-2">
            Stock:{" "}
            <span className="font-bold text-slate-700">{p.stock ?? "—"}</span>
          </div>
        )}

        <button
          onClick={(e) => onAddToCart(e, p, selectedVariant, isVariable)}
          className={[
            "cursor-pointer mt-4 w-full rounded-md border-2 font-bold py-2.5 text-sm transition-all",
            showAddedFeedback
              ? "border-green-600 bg-green-600 text-white"
              : "border-[#008159] text-[#008159] hover:bg-[#008159] hover:text-white",
          ].join(" ")}
        >
          {showAddedFeedback ? (
            <>
              <span className="inline-block animate-pulse">✓</span> Added to Cart!
            </>
          ) : (
            <>
              <ShoppingCart className="inline mr-2 w-5 h-5" />
              কার্টে যুক্ত করুন
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function VariantRow({ variants, selectedVariantId, setSelectedVariantId }) {
  const mainKey = useMemo(() => {
    const keys = Object.keys(variants?.[0]?.attributes || {});
    return keys[0] || null;
  }, [variants]);

  return (
    <div className="mt-3">
      <div className="text-xs text-slate-600 font-bold">
        {mainKey ? `${mainKey}:` : "Variant:"}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {variants.map((v) => {
          const label = mainKey ? v.attributes?.[mainKey] : `#${v.id}`;
          const active = v.id === selectedVariantId;

          return (
            <button
              key={v.id}
              onClick={() => setSelectedVariantId(v.id)}
              className={[
                "px-3 py-1.5 rounded-lg border text-xs font-extrabold transition",
                active
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white hover:bg-slate-50 border-gray-300 text-slate-800",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}