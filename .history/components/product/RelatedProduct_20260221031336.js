"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, RotateCw } from "lucide-react";

function formatBDT(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return "৳ —";
  return `৳ ${num.toLocaleString("en-US")}`;
}

function storageUrl(baseUrl, path) {
  if (!baseUrl || !path) return "";
  return `${baseUrl}/storage/${path}`;
}

function normalizeApiUrlToBase(baseUrl, maybeUrl) {
  if (!maybeUrl) return "";
  try {
    const u = new URL(maybeUrl);
    return `${baseUrl}${u.pathname}`;
  } catch {
    return maybeUrl;
  }
}

function getProductImage(p, baseUrl) {
  if (p?.featured_image) return storageUrl(baseUrl, p.featured_image);
  if (p?.featured_image_url) return normalizeApiUrlToBase(baseUrl, p.featured_image_url);
  return "";
}

function getSimplePrice(p) {
  const sale = p?.sale_price != null ? Number(p.sale_price) : null;
  const regular = p?.regular_price != null ? Number(p.regular_price) : null;

  if (sale != null && !Number.isNaN(sale)) return { value: sale, regular };
  if (regular != null && !Number.isNaN(regular)) return { value: regular, regular: null };
  return { value: null, regular: null };
}

function getVariantPrice(v) {
  const sale = v?.sale_price != null ? Number(v.sale_price) : null;
  const regular = v?.regular_price != null ? Number(v.regular_price) : null;

  if (sale != null && !Number.isNaN(sale)) return { value: sale, regular };
  if (regular != null && !Number.isNaN(regular)) return { value: regular, regular: null };
  return { value: null, regular: null };
}

function getVariableRange(p) {
  const vals = (p?.variants || [])
    .map((v) => getVariantPrice(v).value)
    .filter((x) => x != null);

  if (!vals.length) return { min: null, max: null };
  return { min: Math.min(...vals), max: Math.max(...vals) };
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

export default function RelatedProduct({ productId, title = "Related Products" }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [items, setItems] = useState([]);

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds
  const TIMEOUT_DURATION = 12000; // 12 seconds

  const fetchRelatedProducts = useCallback(async (isRetryAttempt = false) => {
    if (!baseUrl) {
      setError("NEXT_PUBLIC_API_BASE_URL missing");
      setLoading(false);
      return;
    }
    if (!productId && productId !== 0) {
      setError("productId missing");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

    try {
      if (isRetryAttempt) {
        setIsRetrying(true);
      }
      setLoading(true);
      setError("");

      const res = await fetch(`${baseUrl}/api/products/${productId}/related`, {
        cache: "no-store",
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);

      const data = await res.json();

      // accept common shapes:
      // - { products: [...] }
      // - { related: [...] }
      // - [...]
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.products)
        ? data.products
        : Array.isArray(data?.related)
        ? data.related
        : [];

      setItems(list);
      setRetryCount(0); // Reset retry count on success
      setError("");
    } catch (e) {
      const errorMessage = e?.name === "AbortError" 
        ? "Request timeout. The server is taking too long to respond." 
        : e.message;
      
      setError(errorMessage);
      setItems([]);

      // Auto retry logic
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, RETRY_DELAY);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      setIsRetrying(false);
    }
  }, [baseUrl, productId, retryCount]);

  // Initial fetch and retry on retryCount change
  useEffect(() => {
    fetchRelatedProducts(retryCount > 0);
  }, [fetchRelatedProducts, retryCount]);

  const handleManualRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Full error state (no data loaded)
  if (error && !items.length && !loading) {
    return (
      <section>
        <div className="flex items-center gap-4 mb-5">
          <div className="h-px flex-1 bg-slate-200" />
          <h2 className="text-2xl font-extrabold">{title}</h2>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <div className="text-red-600 mb-4">
            <span className="text-5xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-red-700 mb-2">Failed to Load Related Products</h3>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          
          <div className="space-y-3">
            <button
              onClick={handleManualRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </button>
            
            {retryCount > 0 && retryCount < MAX_RETRIES && (
              <div className="text-sm text-gray-600">
                Auto retrying... ({retryCount}/{MAX_RETRIES})
              </div>
            )}
            
            {retryCount >= MAX_RETRIES && (
              <div className="text-sm text-gray-600">
                Maximum retry attempts reached. Please try again later.
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-4 mb-5">
        <div className="h-px flex-1 bg-slate-200" />
        <h2 className="text-2xl font-extrabold">{title}</h2>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Warning banner for partial data with error */}
      {error && items.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600">⚠️</span>
            <p className="text-sm text-yellow-700">
              Some related products couldn't be loaded completely. {error}
            </p>
          </div>
          <button
            onClick={handleManualRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition disabled:opacity-50"
          >
            <RotateCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl soft-card overflow-hidden">
              <div className="relative p-5 bg-[#FAF8F6]">
                <div className="h-44 rounded-xl bg-white/70 animate-pulse" />
              </div>
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
                <div className="h-6 w-1/3 bg-slate-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-slate-200 rounded-md animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : !items.length ? (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500 mb-4">No related products found.</p>
          {error && (
            <button
              onClick={handleManualRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((p) => (
            <RelatedCard key={p.id || p.slug} p={p} baseUrl={baseUrl} />
          ))}
        </div>
      )}
    </section>
  );
}

function RelatedCard({ p, baseUrl }) {
  const isVariable = p?.product_type === "variable";
  const imgSrc = getProductImage(p, baseUrl);
  const shortText = stripHtml(p?.short_description) || stripHtml(p?.description);

  const priceNode = useMemo(() => {
    if (!isVariable) {
      const pr = getSimplePrice(p);
      return (
        <div className="mt-2 font-extrabold">
          {pr.value == null ? "৳ —" : formatBDT(pr.value)}
          {pr.regular != null && pr.value != null && pr.value < pr.regular ? (
            <span className="ml-2 text-sm text-slate-500 line-through">{formatBDT(pr.regular)}</span>
          ) : null}
        </div>
      );
    }
    const rg = getVariableRange(p);
    return (
      <div className="mt-2 font-extrabold">
        {rg.min == null ? "৳ —" : `${formatBDT(rg.min)} - ${formatBDT(rg.max)}`}
      </div>
    );
  }, [p, isVariable]);

  return (
    <article className="bg-white rounded-2xl soft-card overflow-hidden h-full flex flex-col">
      <div className="relative p-5 bg-[#FAF8F6]">
        <button className="cursor-pointer absolute right-4 top-4 w-9 h-9 rounded-full bg-white border border-gray-300 flex items-center justify-center">
          <Heart className="w-5 h-5" />
        </button>

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
        <Link href={`/product/${p.id}`}>
          <div className="font-bold leading-snug line-clamp-2 hover:underline">{p.name}</div>
        </Link>

        <div className="text-sm text-slate-500 mt-1 line-clamp-2">
          {shortText || (isVariable ? "Variable product" : "Simple product")}
        </div>

        {priceNode}

        <button
          className="cursor-pointer mt-4 w-full rounded-md border-2 border-[#008159] text-[#008159] font-bold py-2.5 text-sm hover:bg-[#008159] hover:text-white"
          onClick={() => {
            console.log("Add to cart (demo):", { product_id: p.id, qty: 1 });
            alert("Cart action demo ✅ (connect cart later)");
          }}
        >
          <ShoppingCart className="inline mr-2 w-5 h-5" />
          কার্টে যুক্ত করুন
        </button>
      </div>
    </article>
  );
}