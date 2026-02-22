"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Container from "@/components/ui/Container";
import { ShoppingCart, SlidersHorizontal, X, RotateCw, ArrowRight } from "lucide-react";
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

function getBrandName(p) {
  return p?.brand?.name || p?.brand || null;
}

/* ===================== NEW: Special Offer Page ===================== */
/**
 * Fetches products from:
 *  - http://10.211.112.19:8000/api/products/brand/:slug
 *
 * Example route:
 *  app/(shop)/brand/[slug]/page.jsx
 *  <BrandProductsPage slug="special-offer" title="Special Offer" />
 *
 * Or for a dedicated offer page:
 *  app/(shop)/special-offer/page.jsx
 *  <BrandProductsPage slug="special-offer" title="Special Offer" />
 */

export default function BrandProductsPage({ slug = "special-offer", title }) {
  // keep your env support, but fall back to the IP provided
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://10.211.112.19:8000";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const [products, setProducts] = useState([]);

  // UI: sort & responsive filter drawer
  const [sort, setSort] = useState("newest");
  const [openFilter, setOpenFilter] = useState(false);

  // Filters
  const [priceMax, setPriceMax] = useState(500000);
  const [type, setType] = useState("all"); // all | simple | variable
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  // Pagination
  const [visibleCount, setVisibleCount] = useState(8); // Show 8 products initially

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

        // ✅ by slug name
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

  const allBrands = useMemo(() => {
    const list = products.map(getBrandName).filter(Boolean);
    return Array.from(new Set(list));
  }, [products]);

  const allSizes = useMemo(() => {
    const sizes = [];
    for (const p of products) {
      for (const v of p?.variants || []) {
        if (v?.attributes?.Size) sizes.push(v.attributes.Size);
      }
    }
    return Array.from(new Set(sizes));
  }, [products]);

  const clearAll = () => {
    setPriceMax(500000);
    setType("all");
    setInStockOnly(false);
    setSelectedBrands([]);
    setSelectedSizes([]);
  };

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (type !== "all") list = list.filter((p) => p.product_type === type);

    if (inStockOnly) {
      list = list.filter((p) => {
        if (p.product_type === "simple") return (p.stock ?? 0) > 0;
        return (p.variants || []).some((v) => (v.stock ?? 0) > 0);
      });
    }

    if (selectedBrands.length) {
      list = list.filter((p) => selectedBrands.includes(getBrandName(p)));
    }

    if (selectedSizes.length) {
      list = list.filter((p) => {
        if (p.product_type !== "variable") return false;
        return (p.variants || []).some((v) =>
          selectedSizes.includes(v?.attributes?.Size)
        );
      });
    }

    list = list.filter((p) => {
      if (p.product_type === "simple") {
        const pr = priceForSimple(p).value;
        return pr == null ? true : pr <= priceMax;
      }
      const min = rangeForVariable(p).min;
      return min == null ? true : min <= priceMax;
    });

    if (sort === "price_low") {
      list.sort((a, b) => {
        const av =
          a.product_type === "simple"
            ? priceForSimple(a).value ?? 1e18
            : rangeForVariable(a).min ?? 1e18;
        const bv =
          b.product_type === "simple"
            ? priceForSimple(b).value ?? 1e18
            : rangeForVariable(b).min ?? 1e18;
        return av - bv;
      });
    }

    if (sort === "price_high") {
      list.sort((a, b) => {
        const av =
          a.product_type === "simple"
            ? priceForSimple(a).value ?? -1
            : rangeForVariable(a).max ?? -1;
        const bv =
          b.product_type === "simple"
            ? priceForSimple(b).value ?? -1
            : rangeForVariable(b).max ?? -1;
        return bv - av;
      });
    }

    return list;
  }, [products, type, inStockOnly, selectedBrands, selectedSizes, priceMax, sort]);

  const handleViewAll = () => {
    setVisibleCount(filteredProducts.length);
  };

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(8);
  }, [filteredProducts.length]);

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
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <Container className="py-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
         
            <div className="flex items-center gap-4 mb-5">
                <div className="h-px flex-1 bg-slate-200" />
                <h2 className="text-2xl font-extrabold">{title || slug?.replace(/-/g, " ") || "Brand"}</h2>
                <div className="h-px flex-1 bg-slate-200" />
            </div>
          

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => setOpenFilter(true)}
              className="lg:hidden rounded-xl border border-gray-300 bg-white hover:bg-slate-50 font-bold px-4 py-2.5 inline-flex items-center gap-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        {error && products.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex flex-wrap items-center justify-between gap-4">
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

        <div className="mt-6 grid lg:grid-cols-4 gap-6">
          <SidebarFilters
            priceMax={priceMax}
            setPriceMax={setPriceMax}
            type={type}
            setType={setType}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            allBrands={allBrands}
            selectedBrands={selectedBrands}
            setSelectedBrands={setSelectedBrands}
            allSizes={allSizes}
            selectedSizes={selectedSizes}
            setSelectedSizes={setSelectedSizes}
            onClear={clearAll}
            disabled={loading}
          />

          <section className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
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
                ))}
              </div>
            ) : !filteredProducts.length ? (
              <div className="bg-white border border-gray-300 rounded-2xl p-6 text-sm text-slate-600">
                No products match your filters.
                <button
                  onClick={clearAll}
                  className="ml-2 text-emerald-700 font-bold hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                  {filteredProducts.slice(0, visibleCount).map((p) => (
                    <CategoryProductCard key={p.id} p={p} baseUrl={baseUrl} />
                  ))}
                </div>
                
                {visibleCount < filteredProducts.length && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={handleViewAll}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#008159] hover:bg-[#006b47] text-white font-bold rounded-xl transition-colors"
                    >
                      View All Products ({filteredProducts.length})
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </Container>

      {openFilter ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenFilter(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[92%] max-w-md bg-white border-l border-gray-300 p-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="font-extrabold text-lg">Filters</div>
              <button
                onClick={() => setOpenFilter(false)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-bold hover:bg-slate-50 inline-flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Close
              </button>
            </div>

            <div className="mt-4">
              <SidebarFiltersContent
                priceMax={priceMax}
                setPriceMax={setPriceMax}
                type={type}
                setType={setType}
                inStockOnly={inStockOnly}
                setInStockOnly={setInStockOnly}
                allBrands={allBrands}
                selectedBrands={selectedBrands}
                setSelectedBrands={setSelectedBrands}
                allSizes={allSizes}
                selectedSizes={selectedSizes}
                setSelectedSizes={setSelectedSizes}
                onClear={clearAll}
                disabled={loading}
              />
            </div>

            <button
              onClick={() => setOpenFilter(false)}
              className="mt-4 w-full rounded-xl bg-[#008159] hover:opacity-90 text-white font-extrabold py-3"
            >
              Apply Filters
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ===================== Sidebar ===================== */

function SidebarFilters({ disabled, ...props }) {
  return (
    <>
    </>
    // <aside className="hidden lg:block">
    //   <div className="border border-gray-300 bg-white rounded-2xl soft-card overflow-hidden sticky top-24">
    //     <div className="px-5 py-4 border-b border-gray-300 flex items-center justify-between">
    //       <div className="font-extrabold">Filters</div>
    //       <button
    //         onClick={props.onClear}
    //         className="text-sm font-bold text-emerald-700 hover:underline disabled:opacity-50"
    //         disabled={disabled}
    //       >
    //         Clear
    //       </button>
    //     </div>
    //     <div className="p-5">
    //       <SidebarFiltersContent disabled={disabled} {...props} />
    //     </div>
    //   </div>
    // </aside>
  );
}

function SidebarFiltersContent({
  priceMax,
  setPriceMax,
  type,
  setType,
  inStockOnly,
  setInStockOnly,
  allBrands,
  selectedBrands,
  setSelectedBrands,
  allSizes,
  selectedSizes,
  setSelectedSizes,
  onClear,
  disabled = false,
}) {
  const toggle = (arr, value, setter) => {
    if (disabled) return;
    setter((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="font-extrabold text-sm mb-2">Product Type</div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { k: "all", label: "All" },
            { k: "simple", label: "Simple" },
            { k: "variable", label: "Variable" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => !disabled && setType(t.k)}
              disabled={disabled}
              className={[
                "rounded-xl border border-gray-300 px-3 py-2 text-xs font-extrabold",
                disabled && "opacity-50 cursor-not-allowed",
                type === t.k
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-800 hover:bg-slate-50",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="font-extrabold text-sm">In Stock Only</div>
          <div className="text-xs text-slate-500 mt-0.5">
            Hide out-of-stock products
          </div>
        </div>
        <button
          onClick={() => !disabled && setInStockOnly((x) => !x)}
          disabled={disabled}
          className={[
            "w-12 h-7 rounded-full border transition relative",
            disabled && "opacity-50 cursor-not-allowed",
            inStockOnly
              ? "bg-[#008159] border-[#008159]"
              : "bg-slate-200 border-slate-300",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition",
              inStockOnly ? "left-5" : "left-0.5",
            ].join(" ")}
          />
        </button>
      </div>

      <div>
        <div className="font-extrabold text-sm">Price</div>
        <div className="text-xs text-slate-500 mt-1">
          Max: {formatBDT(priceMax)}
        </div>
        <input
          type="range"
          min="100"
          max="500000"
          step="50"
          value={priceMax}
          onChange={(e) =>
            !disabled && setPriceMax(parseInt(e.target.value, 10))
          }
          disabled={disabled}
          className={["mt-3 w-full", disabled && "opacity-50 cursor-not-allowed"].join(
            " "
          )}
        />
      </div>

      {allBrands.length ? (
        <div>
          <div className="font-extrabold text-sm">Brand</div>
          <div className="mt-3 space-y-2 max-h-44 overflow-auto pr-1">
            {allBrands.map((b) => (
              <label
                key={b}
                className={["flex items-center gap-2 text-sm", disabled && "opacity-50"].join(
                  " "
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(b)}
                  onChange={() => toggle(selectedBrands, b, setSelectedBrands)}
                  disabled={disabled}
                  className="h-4 w-4"
                />
                <span className="text-slate-700">{b}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {allSizes.length ? (
        <div>
          <div className="font-extrabold text-sm">Size</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {allSizes.map((s) => {
              const active = selectedSizes.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggle(selectedSizes, s, setSelectedSizes)}
                  disabled={disabled}
                  className={[
                    "px-3 py-1.5 rounded-lg border text-xs font-extrabold transition",
                    disabled && "opacity-50 cursor-not-allowed",
                    active
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white hover:bg-slate-50 border-gray-300 text-slate-800",
                  ].join(" ")}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-slate-500">Based on variant attributes</div>
        </div>
      ) : null}

      <button
        onClick={onClear}
        disabled={disabled}
        className="w-full rounded-xl border border-gray-300 bg-white hover:bg-slate-50 font-extrabold py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Clear all filters
      </button>
    </div>
  );
}

/* ===================== Product Card ===================== */

function CategoryProductCard({ p, baseUrl }) {
  const { addItem } = useCart();

  const isVariable = p.product_type === "variable";
  const [selectedVariantId, setSelectedVariantId] = useState(
    isVariable && p.variants?.length ? p.variants[0].id : null
  );

  const selectedVariant = useMemo(() => {
    if (!isVariable) return null;
    return (p.variants || []).find((v) => v.id === selectedVariantId) || null;
  }, [isVariable, p, selectedVariantId]);

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

    const rg = rangeForVariable(p);
    return (
      <div className="mt-2 font-extrabold">
        {rg.min == null ? "৳ —" : `${formatBDT(rg.min)} - ${formatBDT(rg.max)}`}
      </div>
    );
  }, [isVariable, p, selectedVariant]);

  const handleAddToCart = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    const v = isVariable ? selectedVariant : null;

    const price = isVariable
      ? v?.sale_price ?? v?.regular_price
      : p?.sale_price ?? p?.regular_price;

    const oldPrice = isVariable
      ? v?.regular_price && v?.sale_price
        ? v.regular_price
        : null
      : p?.regular_price && p?.sale_price
      ? p.regular_price
      : null;

    const variantLabel = isVariable
      ? (() => {
          const attrs = v?.attributes || {};
          const keys = Object.keys(attrs);
          if (!keys.length) return `Variant #${v?.id}`;
          return keys.map((k) => `${k}: ${attrs[k]}`).join(", ");
        })()
      : p?.variant ?? "";

    const image =
      (isVariable && v?.image_path ? `${baseUrl}/storage/${v.image_path}` : "") ||
      getProductImage(p, baseUrl) ||
      "";

    addItem(
      {
        productId: p.id,
        variantId: v?.id ?? null,
        name: p.name,
        category: p?.category?.name || p?.category?.slug || "",
        variantLabel,
        image,
        price,
        oldPrice,
        stock: isVariable ? v?.stock : p?.stock,
        attrs: isVariable ? v?.attributes || null : null,
      },
      1
    );

    alert("Added to cart ✅");
  };

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

        {isVariable && p.variants?.length ? (
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
          onClick={handleAddToCart}
          className="cursor-pointer mt-4 w-full rounded-md border-2 border-[#008159] text-[#008159] font-bold py-2.5 text-sm hover:bg-[#008159] hover:text-white"
        >
          <ShoppingCart className="inline mr-2 w-5 h-5" />
          কার্টে যুক্ত করুন
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