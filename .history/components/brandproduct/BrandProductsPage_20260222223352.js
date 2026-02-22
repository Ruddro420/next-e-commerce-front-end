"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Container from "@/components/ui/Container";
import { ShoppingCart, RotateCw, Heart, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/store/cartStore";

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

  if (sale != null && !Number.isNaN(sale)) return { value: sale, regular };
  if (regular != null && !Number.isNaN(regular))
    return { value: regular, regular: null };
  return { value: null, regular: null };
}

function priceForVariant(v) {
  const sale = v?.sale_price != null ? Number(v.sale_price) : null;
  const regular = v?.regular_price != null ? Number(v.regular_price) : null;

  if (sale != null && !Number.isNaN(sale)) return { value: sale, regular };
  if (regular != null && !Number.isNaN(regular))
    return { value: regular, regular: null };
  return { value: null, regular: null };
}

function rangeForVariable(p) {
  const vals = (p?.variants || [])
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
  const [showAddedFeedback, setShowAddedFeedback] = useState({});

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;
  const TIMEOUT_DURATION = 12000;

  const fetchBrandProducts = useCallback(
    async (isRetryAttempt = false) => {
      if (!baseUrl) {
        setError("NEXT_PUBLIC_API_BASE_URL missing. Restart dev server after setting .env.local");
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
            : e.message;

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
  const displayProducts = useMemo(() => {
    return products.slice(0, 4);
  }, [products]);

  const handleAddToCart = (e, product, selectedVariant = null, isVariable = false) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    const v = isVariable ? selectedVariant : null;

    const price = isVariable
      ? v?.sale_price ?? v?.regular_price
      : product?.sale_price ?? product?.regular_price;

    const oldPrice = isVariable
      ? v?.regular_price && v?.sale_price
        ? v.regular_price
        : null
      : product?.regular_price && product?.sale_price
        ? product.regular_price
        : null;

    const variantLabel = isVariable
      ? (() => {
          const attrs = v?.attributes || {};
          const keys = Object.keys(attrs);
          if (!keys.length) return `Variant #${v?.id}`;
          return keys.map((k) => `${k}: ${attrs[k]}`).join(", ");
        })()
      : product?.variant ?? "";

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

    // Show feedback
    setShowAddedFeedback(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setShowAddedFeedback(prev => ({ ...prev, [product.id]: false }));
    }, 2000);
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
                <RotateCw
                  className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`}
                />
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
          <h2 className="text-2xl font-extrabold text-center">
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
              <RotateCw
                className={`w-3 h-3 ${isRetrying ? "animate-spin" : ""}`}
              />
              Retry
            </button>
          </div>
        )}

        {/* Products Grid - Exactly 4 in a row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading ? (
            // Loading skeletons
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
            displayProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
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

function ProductCard({ product, baseUrl, showAddedFeedback, onAddToCart }) {
  const isVariable = product.product_type === "variable";
  const [selectedVariantId, setSelectedVariantId] = useState(
    isVariable && product.variants?.length ? product.variants[0].id : null
  );
  const [showVariantSelector, setShowVariantSelector] = useState(false);

  const selectedVariant = useMemo(() => {
    if (!isVariable) return null;
    return (product.variants || []).find((v) => v.id === selectedVariantId) || null;
  }, [isVariable, product, selectedVariantId]);

  const imgSrc = useMemo(() => {
    if (isVariable && selectedVariant?.image_path) {
      return getVariantImage(selectedVariant, baseUrl);
    }
    return getProductImage(product, baseUrl);
  }, [isVariable, selectedVariant, product, baseUrl]);

  const shortText = stripHtml(product.short_description) || stripHtml(product.description);

  // Get variant attributes for display
  const variantAttributes = useMemo(() => {
    if (!isVariable || !product.variants?.length) return null;
    
    // Get all unique attribute keys
    const allKeys = new Set();
    product.variants.forEach(v => {
      if (v.attributes) {
        Object.keys(v.attributes).forEach(key => allKeys.add(key));
      }
    });
    
    return {
      keys: Array.from(allKeys),
      variants: product.variants
    };
  }, [isVariable, product.variants]);

  // Get current variant label for display
  const currentVariantLabel = useMemo(() => {
    if (!isVariable || !selectedVariant || !selectedVariant.attributes) return null;
    
    const attrs = selectedVariant.attributes;
    const keys = Object.keys(attrs);
    if (!keys.length) return null;
    
    return keys.map(key => `${attrs[key]}`).join(' / ');
  }, [isVariable, selectedVariant]);

  // Get stock for selected variant
  const currentStock = useMemo(() => {
    if (isVariable) {
      return selectedVariant?.stock ?? 0;
    }
    return product.stock ?? 0;
  }, [isVariable, selectedVariant, product.stock]);

  const priceNode = useMemo(() => {
    if (!isVariable) {
      const pr = priceForSimple(product);
      return (
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-lg font-extrabold text-gray-900">
            {pr.value == null ? "৳ —" : formatBDT(pr.value)}
          </span>
          {pr.regular != null && pr.value != null && pr.value < pr.regular && (
            <span className="text-sm text-slate-500 line-through">
              {formatBDT(pr.regular)}
            </span>
          )}
        </div>
      );
    }

    if (selectedVariant) {
      const pr = priceForVariant(selectedVariant);
      return (
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-lg font-extrabold text-gray-900">
            {pr.value == null ? "৳ —" : formatBDT(pr.value)}
          </span>
          {pr.regular != null && pr.value != null && pr.value < pr.regular && (
            <span className="text-sm text-slate-500 line-through">
              {formatBDT(pr.regular)}
            </span>
          )}
        </div>
      );
    }

    const rg = rangeForVariable(product);
    return (
      <div className="text-lg font-extrabold text-gray-900">
        {rg.min == null ? "৳ —" : `${formatBDT(rg.min)} - ${formatBDT(rg.max)}`}
      </div>
    );
  }, [isVariable, product, selectedVariant]);

  return (
    <article className="bg-white rounded-2xl soft-card overflow-hidden h-full flex flex-col group hover:shadow-lg transition-shadow duration-300">
      <div className="relative p-5 bg-gradient-to-b from-[#FAF8F6] to-white">
        <button className="cursor-pointer absolute right-4 top-4 w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all z-10 shadow-sm">
          <Heart className="w-5 h-5 text-gray-600" />
        </button>
        <Link href={`/product/${product.id}`} className="block">
          <div className="h-44 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={product.name}
                className="object-contain w-40 h-40 rounded-xl"
                loading="lazy"
              />
            ) : (
              <div className="w-40 h-40 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-slate-400">
                No image
              </div>
            )}
          </div>
        </Link>
        
        {/* Variant badge for variable products */}
        {isVariable && product.variants?.length > 0 && (
          <div className="absolute left-4 bottom-4">
            <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-600 border border-gray-200 shadow-sm">
              {product.variants.length} вариантов
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/product/${product.id}`} className="hover:underline">
          <h3 className="font-bold text-gray-800 leading-snug line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>
        
        <div className="text-sm text-slate-500 mt-1 line-clamp-2 min-h-[2.5rem]">
          {shortText || `SKU: ${product.sku || "—"}`}
        </div>

        {/* Current variant display */}
        {isVariable && currentVariantLabel && (
          <div className="mt-2">
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-200">
              <span className="text-xs font-medium text-gray-700">{currentVariantLabel}</span>
            </div>
          </div>
        )}

        {/* Price Section */}
        <div className="mt-2">
          {priceNode}
        </div>

        {/* Variant Selector */}
        {isVariable && variantAttributes && variantAttributes.variants.length > 1 && (
          <div className="mt-3">
            <button
              onClick={() => setShowVariantSelector(!showVariantSelector)}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>Выберите вариант</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showVariantSelector ? 'rotate-180' : ''}`} />
            </button>
            
            {showVariantSelector && (
              <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                {variantAttributes.variants.map((v) => {
                  const isSelected = v.id === selectedVariantId;
                  const variantPrice = priceForVariant(v);
                  const attributes = v.attributes || {};
                  const attributeValues = Object.values(attributes).join(' / ');
                  
                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariantId(v.id);
                        setShowVariantSelector(false);
                      }}
                      className={[
                        "w-full text-left px-3 py-2 rounded-md text-xs transition-colors mb-1 last:mb-0",
                        isSelected
                          ? "bg-[#008159] text-white"
                          : "hover:bg-white text-gray-700"
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{attributeValues || `Вариант ${v.id}`}</span>
                        <span className="font-bold">{formatBDT(variantPrice.value)}</span>
                      </div>
                      {v.stock > 0 ? (
                        <span className="text-[10px] opacity-75">В наличии: {v.stock}</span>
                      ) : (
                        <span className="text-[10px] text-red-500">Нет в наличии</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Stock indicator */}
        <div className="mt-3 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${currentStock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-slate-600">
            {currentStock > 0 ? `В наличии: ${currentStock}` : 'Нет в наличии'}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={(e) => onAddToCart(e, product, selectedVariant, isVariable)}
          disabled={currentStock === 0}
          className={[
            "cursor-pointer mt-4 w-full rounded-md border-2 font-bold py-2.5 text-sm transition-all relative overflow-hidden",
            currentStock === 0 && "opacity-50 cursor-not-allowed border-gray-300 text-gray-400",
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
              {currentStock > 0 ? "কার্টে যুক্ত করুন" : "স্টক আউট"}
            </>
          )}
        </button>
      </div>
    </article>
  );
}