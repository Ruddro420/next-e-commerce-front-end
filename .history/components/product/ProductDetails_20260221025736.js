/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Container from "@/components/ui/Container";
import { Heart, ShoppingCart, RotateCw } from "lucide-react";

/* ================= helpers ================= */

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

function normalizeApiUrlToBase(baseUrl, maybeUrl) {
  if (!maybeUrl) return "";
  try {
    const u = new URL(maybeUrl);
    return `${baseUrl}${u.pathname}`; // replace localhost with baseUrl
  } catch {
    return maybeUrl;
  }
}

function getProductImage(product, baseUrl) {
  // prefer path-based storage to avoid localhost issues
  if (product?.featured_image) return storageUrl(baseUrl, product.featured_image);
  if (product?.featured_image_url) return normalizeApiUrlToBase(baseUrl, product.featured_image_url);
  return "";
}

function getVariantImage(variant, baseUrl) {
  if (variant?.image_path) return storageUrl(baseUrl, variant.image_path);
  return "";
}

function getPriceSimple(p) {
  const sale = p?.sale_price != null ? Number(p.sale_price) : null;
  const regular = p?.regular_price != null ? Number(p.regular_price) : null;

  if (sale != null && !Number.isNaN(sale)) return { value: sale, regular };
  if (regular != null && !Number.isNaN(regular)) return { value: regular, regular: null };
  return { value: null, regular: null };
}

function getPriceVariant(v) {
  const sale = v?.sale_price != null ? Number(v.sale_price) : null;
  const regular = v?.regular_price != null ? Number(v.regular_price) : null;

  if (sale != null && !Number.isNaN(sale)) return { value: sale, regular };
  if (regular != null && !Number.isNaN(regular)) return { value: regular, regular: null };
  return { value: null, regular: null };
}

function pickPrimaryVariantKey(variants) {
  if (!variants?.length) return null;
  const keys = Object.keys(variants[0]?.attributes || {});
  return keys[0] || null; // e.g. "Size", "Color"
}

/* ============== component ============== */

export default function ProductDetails({ productId }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const [product, setProduct] = useState(null);

  // gallery / selection
  const [activeImage, setActiveImage] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds
  const TIMEOUT_DURATION = 12000; // 12 seconds

  // demo actions (hook your cart/order later)
  const handleAddToCart = () => {
    const payload = {
      product_id: product?.id,
      variant_id: selectedVariantId,
      qty: 1,
    };
    console.log("ADD TO CART:", payload);
    alert("Cart action demo ✅ (connect your cart API/store now)");
  };

  const fetchProduct = useCallback(async (isRetryAttempt = false) => {
    if (!baseUrl) {
      setError("NEXT_PUBLIC_API_BASE_URL missing. Restart dev server after setting .env.local");
      setLoading(false);
      return;
    }
    if (!productId && productId !== 0) {
      setError("productId missing from route params");
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

      const res = await fetch(`${baseUrl}/api/products/${productId}`, {
        cache: "no-store",
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);

      const data = await res.json();
      const p = data?.product || null;
      setProduct(p);

      // setup selection + image
      if (p?.product_type === "variable" && p?.variants?.length) {
        setSelectedVariantId(p.variants[0].id);
        const vImg = getVariantImage(p.variants[0], baseUrl);
        setActiveImage(vImg || getProductImage(p, baseUrl));
      } else {
        setSelectedVariantId(null);
        setActiveImage(getProductImage(p, baseUrl));
      }

      // Reset retry count on success
      setRetryCount(0);
      setError("");
    } catch (e) {
      const errorMessage = e?.name === "AbortError" 
        ? "Request timeout. The server is taking too long to respond." 
        : e.message;
      
      setError(errorMessage);
      setProduct(null);

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
    fetchProduct(retryCount > 0);
  }, [fetchProduct, retryCount]);

  const handleManualRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const isVariable = product?.product_type === "variable";
  const variants = product?.variants || [];
  const primaryKey = useMemo(() => pickPrimaryVariantKey(variants), [variants]);

  const selectedVariant = useMemo(() => {
    if (!isVariable) return null;
    return variants.find((v) => v.id === selectedVariantId) || null;
  }, [isVariable, variants, selectedVariantId]);

  const availabilityText = useMemo(() => {
    if (!product) return "";
    if (!isVariable) {
      const st = product.stock ?? 0;
      return st > 0 ? "In Stock" : "Out of Stock";
    }
    const anyStock = variants.some((v) => (v.stock ?? 0) > 0);
    return anyStock ? "In Stock" : "Out of Stock";
  }, [product, isVariable, variants]);

  const priceBlock = useMemo(() => {
    if (!product) return null;

    // simple
    if (!isVariable) {
      const pr = getPriceSimple(product);
      return (
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold">{pr.value == null ? "৳ —" : formatBDT(pr.value)}</span>
          {pr.regular != null && pr.value != null && pr.value < pr.regular ? (
            <span className="text-sm text-red-500 line-through">{formatBDT(pr.regular)}</span>
          ) : null}
        </div>
      );
    }

    // variable (selected variant)
    if (selectedVariant) {
      const pr = getPriceVariant(selectedVariant);
      return (
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold">{pr.value == null ? "৳ —" : formatBDT(pr.value)}</span>
          {pr.regular != null && pr.value != null && pr.value < pr.regular ? (
            <span className="text-sm text-red-500 line-through">{formatBDT(pr.regular)}</span>
          ) : null}
        </div>
      );
    }

    return (
      <div className="text-lg font-extrabold">
        {formatBDT(0)} {/* should not happen; always select first variant */}
      </div>
    );
  }, [product, isVariable, selectedVariant]);

  // Build thumbnails from: featured + gallery + selected variant image (dedup)
  const thumbnails = useMemo(() => {
    if (!product) return [];
    const list = [];

    const featured = getProductImage(product, baseUrl);
    if (featured) list.push(featured);

    for (const g of product.gallery || []) {
      // if gallery entries are strings like "products/gallery/xxx.jpg"
      if (typeof g === "string") {
        const url = storageUrl(baseUrl, g);
        if (url) list.push(url);
      } else if (g?.image_path) {
        const url = storageUrl(baseUrl, g.image_path);
        if (url) list.push(url);
      } else if (g?.url) {
        list.push(normalizeApiUrlToBase(baseUrl, g.url));
      }
    }

    if (selectedVariant?.image_path) {
      const v = getVariantImage(selectedVariant, baseUrl);
      if (v) list.unshift(v);
    }

    // unique
    return Array.from(new Set(list)).slice(0, 6);
  }, [product, baseUrl, selectedVariant]);

  const shortDesc = stripHtml(product?.short_description);
  const fullDesc = product?.description || "";

  const categoryLabel = product?.category?.name || product?.category?.slug || "Category";
  const brandLabel = product?.brand?.name || "";

  const mainImage = activeImage || thumbnails[0] || "";

  const onVariantChange = (variantId) => {
    setSelectedVariantId(variantId);
    const v = variants.find((x) => x.id === variantId);
    const vImg = getVariantImage(v, baseUrl);
    setActiveImage(vImg || getProductImage(product, baseUrl));
  };

  // Error state with retry options
  if (error && !product) {
    return (
      <div className="bg-white">
        <Container className="py-6">
          <div className="rounded-lg border border-gray-300 bg-red-50 p-8 text-center">
            <div className="text-red-600 mb-4">
              <span className="text-5xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-red-700 mb-2">Failed to Load Product</h3>
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
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Container className="py-6">
        {/* Warning banner for partial data with error */}
        {error && product && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⚠️</span>
              <p className="text-sm text-yellow-700">
                Some product information couldn't be loaded completely. {error}
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

        {/* loading state */}
        {loading && !product ? (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-lg border border-gray-300 bg-white p-3">
              <div className="aspect-[16/9] w-full rounded-md bg-slate-100 animate-pulse" />
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="aspect-[16/9] w-full rounded bg-slate-100 animate-pulse" />
                <div className="aspect-[16/9] w-full rounded bg-slate-100 animate-pulse" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
              <div className="h-7 w-2/3 bg-slate-200 rounded animate-pulse" />
              <div className="h-6 w-1/3 bg-slate-200 rounded animate-pulse" />
              <div className="h-12 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-12 w-full bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        ) : !product ? (
          <div className="rounded-lg border border-gray-300 bg-white p-6 text-sm text-slate-600">Product not found.</div>
        ) : (
          <>
            {/* TOP GRID */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* LEFT: Gallery */}
              <div>
                <div className="rounded-lg border border-gray-300 bg-white">
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-slate-100">
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                        No Image
                      </div>
                    )}

                    {/* <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute left-[-10%] top-[60%] w-[140%]   rotate-[-15deg]" />
                    </div> */}

                    {/* Wishlist button */}
                    <button className="absolute right-3 top-3 w-10 h-10 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center shadow-sm">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Thumbnails */}
                {thumbnails.length ? (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {thumbnails.slice(0, 2).map((src) => (
                      <button
                        key={src}
                        onClick={() => setActiveImage(src)}
                        className={[
                          "rounded-md border bg-white p-2 hover:shadow-sm transition",
                          mainImage === src ? "border-slate-900" : "border-slate-200",
                        ].join(" ")}
                      >
                        <div className="aspect-[16/9] w-full rounded bg-slate-100 overflow-hidden">
                          <img src={src} alt="Thumbnail" className="w-full h-full object-contain" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* RIGHT: Product Info */}
              <div>
                {/* Breadcrumb / category */}
                <div className="text-xs text-slate-500 mb-1">
                  {categoryLabel}
                  {brandLabel ? <span className="ml-2">• {brandLabel}</span> : null}
                </div>

                <h1 className="text-2xl font-extrabold text-slate-900">{product.name}</h1>

                {/* Price + availability */}
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {priceBlock}

                  <div className="text-sm text-slate-600">
                    <span className="font-semibold">Availability:</span>{" "}
                    <span className={availabilityText === "In Stock" ? "text-emerald-700" : "text-red-600"}>
                      {availabilityText}
                    </span>
                  </div>
                </div>

                {/* Short Description */}
                {shortDesc ? (
                  <>
                    <div className="mt-4 text-sm font-semibold text-slate-800">Product Description:</div>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{shortDesc}</p>
                  </>
                ) : null}

                {/* Variant selector (for variable products) */}
                {isVariable && variants.length ? (
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-slate-800">
                      Choose {primaryKey || "Variant"}:
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {variants.map((v) => {
                        const label = primaryKey ? v.attributes?.[primaryKey] : `#${v.id}`;
                        const active = v.id === selectedVariantId;

                        return (
                          <button
                            key={v.id}
                            onClick={() => onVariantChange(v.id)}
                            className={[
                              "h-8 px-3 rounded border text-sm font-semibold",
                              active
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-300 bg-white hover:bg-slate-50",
                            ].join(" ")}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-2 text-xs text-slate-600">
                      Selected:{" "}
                      <span className="font-semibold">
                        {primaryKey ? selectedVariant?.attributes?.[primaryKey] : selectedVariantId}
                      </span>
                      {"  "}•{" "}
                      <span className="font-semibold">Stock:</span>{" "}
                      <span className="font-semibold">{selectedVariant?.stock ?? "—"}</span>
                    </div>
                  </div>
                ) : null}

                {/* Big add to cart */}
                <button
                  onClick={handleAddToCart}
                  className="mt-5 w-full rounded-md bg-red-800 hover:bg-red-900 text-white font-bold py-3 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  কার্টে যোগ দিন ডেলিভারিতে অর্ডার করুন
                </button>

                {/* 2 buttons row */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button className="rounded-md bg-black hover:bg-slate-900 text-white font-bold py-3">
                    কাস্ট দেখুন
                  </button>
                  <button className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3">
                    অর্ডার করুন
                  </button>
                </div>

                {/* WhatsApp / Messenger */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <a
                    href="https://wa.me/"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 flex items-center justify-center gap-2"
                  >
                    <span>🟢</span> WhatsApp
                  </a>
                  <a
                    href="#"
                    className="rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 flex items-center justify-center gap-2"
                  >
                    <span>💬</span> Messenger
                  </a>
                </div>
              </div>
            </div>

            {/* DISCLAIMER BOX */}
            <div className="mt-8 rounded-lg border bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-7 w-7 rounded-full border flex items-center justify-center text-slate-700">
                  i
                </div>
                <div>
                  <div className="font-bold text-slate-900">Product Disclaimer</div>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                    ছবি/ডিজাইন বোঝানোর জন্য। ডেলিভারি সময়ে পণ্যের রঙ/ডিজাইনে সামান্য
                    পার্থক্য হতে পারে এবং পণ্যের সাইজিং সামান্য ভিন্ন হতে পারে।
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    জরুরি প্রয়োজনে কল করুন:{" "}
                    <span className="font-extrabold">+8809XXX-149449</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Feature Cards */}
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <div className="rounded-lg border bg-white p-6 text-center">
                <div className="text-2xl">🚚</div>
                <div className="mt-2 font-extrabold">Fast Shipping</div>
              </div>

              <div className="rounded-lg border bg-white p-6 text-center">
                <div className="text-2xl">🛡️</div>
                <div className="mt-2 font-extrabold">Secure Payment</div>
                <div className="text-xs text-slate-500 mt-1">100% Protected</div>
              </div>

              <div className="rounded-lg border bg-white p-6 text-center">
                <div className="text-2xl">↩️</div>
                <div className="mt-2 font-extrabold">Easy Returns</div>
              </div>
            </div>

            {/* Description Section (keep HTML) */}
            <div className="mt-6 rounded-lg border bg-white p-6">
              <h2 className="text-xl font-extrabold">Description</h2>
              <div
                className="mt-3 text-sm text-slate-600 leading-relaxed prose max-w-none"
                dangerouslySetInnerHTML={{ __html: fullDesc }}
              />
            </div>
          </>
        )}
      </Container>
    </div>
  );
}