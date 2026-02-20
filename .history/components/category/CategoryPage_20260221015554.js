"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "@/components/ui/Container";

function formatBDT(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return "৳ —";
  return `৳ ${num.toLocaleString("en-US")}`;
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

function getProductPriceInfo(p) {
  // simple product
  if (p.product_type === "simple") {
    const sale = p.sale_price != null ? Number(p.sale_price) : null;
    const regular = p.regular_price != null ? Number(p.regular_price) : null;

    if (sale != null && !Number.isNaN(sale)) return { type: "single", value: sale, regular };
    if (regular != null && !Number.isNaN(regular)) return { type: "single", value: regular, regular: null };
    return { type: "single", value: null, regular: null };
  }

  // variable product: compute range from variants
  const prices = (p.variants || [])
    .map((v) => {
      const sale = v.sale_price != null ? Number(v.sale_price) : null;
      const regular = v.regular_price != null ? Number(v.regular_price) : null;
      const val = sale != null && !Number.isNaN(sale) ? sale : regular;
      return val != null && !Number.isNaN(val) ? val : null;
    })
    .filter((x) => x != null);

  if (!prices.length) return { type: "range", min: null, max: null };

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { type: "range", min, max };
}

function getFeaturedImageUrl(p, baseUrl) {
  // Your API sometimes returns localhost URLs; ignore them and build from paths.
  // featured_image in payload looks like "products/featured/xxx.jpg"
  if (p.featured_image) return `${baseUrl}/storage/${p.featured_image}`;
  // fallback
  if (p.featured_image_url) {
    try {
      const u = new URL(p.featured_image_url);
      return `${baseUrl}${u.pathname}`; // swap hostname to baseUrl
    } catch {
      return p.featured_image_url;
    }
  }
  return "";
}

function getVariantImageUrl(variant, baseUrl) {
  if (!variant?.image_path) return "";
  return `${baseUrl}/storage/${variant.image_path}`;
}

export default function CategoryPage({ categoryId }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [openFilter, setOpenFilter] = useState(false);
  const [sort, setSort] = useState("newest");

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);

  // filters (basic placeholders; you can extend later)
  const [priceMax, setPriceMax] = useState(500000);
  const [rating, setRating] = useState(0); // API doesn't provide rating; keep UI but it won't filter unless you add rating later.

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${baseUrl}/api/categories/${categoryId}/products`, { cache: "no-store" });
        const data = await res.json();
        setCategory(data?.category || null);
        setProducts(Array.isArray(data?.products) ? data.products : []);
      } catch (e) {
        console.error("Category products fetch failed:", e);
        setCategory(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    if (baseUrl && categoryId) load();
  }, [baseUrl, categoryId]);

  const filtered = useMemo(() => {
    let list = [...products];

    // priceMax filter based on computed product price
    list = list.filter((p) => {
      const info = getProductPriceInfo(p);
      if (p.product_type === "simple") {
        const val = info.value;
        return val == null ? true : val <= priceMax;
      }
      // variable: use min price
      if (info.min == null) return true;
      return info.min <= priceMax;
    });

    // rating filter is not supported by API data yet, so we skip it safely.
    // if you add rating later, implement here.

    // sorting
    if (sort === "price_low") {
      list.sort((a, b) => {
        const ai = getProductPriceInfo(a);
        const bi = getProductPriceInfo(b);
        const av = a.product_type === "simple" ? (ai.value ?? 1e18) : (ai.min ?? 1e18);
        const bv = b.product_type === "simple" ? (bi.value ?? 1e18) : (bi.min ?? 1e18);
        return av - bv;
      });
    }

    if (sort === "price_high") {
      list.sort((a, b) => {
        const ai = getProductPriceInfo(a);
        const bi = getProductPriceInfo(b);
        const av = a.product_type === "simple" ? (ai.value ?? -1) : (ai.max ?? -1);
        const bv = b.product_type === "simple" ? (bi.value ?? -1) : (bi.max ?? -1);
        return bv - av;
      });
    }

    return list;
  }, [products, priceMax, rating, sort]);

  const pageTitle = category?.name || "Category";

  return (
    <div className="bg-slate-50 min-h-screen">
      <Container className="py-8">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">Category</div>
            <h1 className="text-2xl md:text-3xl font-extrabold capitalize">{pageTitle}</h1>
            <p className="text-sm text-slate-600 mt-1">
              {loading ? "Loading..." : `${filtered.length} products found`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => setOpenFilter(true)}
              className="lg:hidden rounded-xl border border-gray-300 bg-white hover:bg-slate-50 font-bold px-4 py-2.5"
            >
              Filters
            </button>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-4 gap-6">
          {/* Desktop Filter */}
          <aside className="hidden lg:block">
            <FilterPanel
              priceMax={priceMax}
              setPriceMax={setPriceMax}
              rating={rating}
              setRating={setRating}
            />
          </aside>

          {/* Products */}
          <section className="lg:col-span-3">
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border border-gray-300 bg-white rounded-2xl soft-card overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-gray-300">
                      <div className="h-36 rounded-xl border border-gray-300 bg-white animate-pulse" />
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
                      <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse" />
                      <div className="h-6 w-1/3 bg-slate-200 rounded animate-pulse" />
                      <div className="h-10 w-full bg-slate-200 rounded-xl animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((p) => (
                    <ProductCard key={p.id} p={p} baseUrl={baseUrl} />
                  ))}
                </div>

                {/* Bottom info bar */}
                <div className="mt-8 border border-gray-300 rounded-2xl bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-sm text-slate-600">
                    Showing <span className="font-bold">{filtered.length}</span> items
                  </div>
                  <div className="text-xs text-slate-500">
                    (Pagination UI demo — connect API pagination when ready)
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </Container>

      {/* Mobile Filter Drawer */}
      {openFilter ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenFilter(false)} />
          <div className="absolute right-0 top-0 h-full w-[92%] max-w-md bg-white border-l border-gray-300 p-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="font-extrabold text-lg">Filters</div>
              <button
                onClick={() => setOpenFilter(false)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-bold hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="mt-4">
              <FilterPanel
                priceMax={priceMax}
                setPriceMax={setPriceMax}
                rating={rating}
                setRating={setRating}
              />
            </div>

            <button
              onClick={() => setOpenFilter(false)}
              className="mt-4 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3"
            >
              Apply Filters
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterPanel({ priceMax, setPriceMax, rating, setRating }) {
  const clearAll = () => {
    setPriceMax(500000);
    setRating(0);
  };

  return (
    <div className="border border-gray-300 bg-white rounded-2xl soft-card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-300 flex items-center justify-between">
        <div className="font-extrabold">Filter</div>
        <button onClick={clearAll} className="text-sm font-bold text-emerald-700 hover:underline">
          Clear
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* Price */}
        <div>
          <div className="font-extrabold text-sm">Price</div>
          <div className="text-xs text-slate-500 mt-1">Max: {formatBDT(priceMax)}</div>
          <input
            type="range"
            min="100"
            max="500000"
            step="50"
            value={priceMax}
            onChange={(e) => setPriceMax(parseInt(e.target.value, 10))}
            className="mt-3 w-full"
          />
        </div>

        {/* Rating (UI only unless API provides rating later) */}
        <div>
          <div className="font-extrabold text-sm">Rating</div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[0, 3, 4, 5].map((r) => (
              <button
                key={r}
                onClick={() => setRating(r)}
                className={[
                  "rounded-xl border border-gray-300 px-3 py-2 text-sm font-bold hover:bg-slate-50",
                  rating === r ? "bg-slate-900 text-white" : "bg-white",
                ].join(" ")}
              >
                {r === 0 ? "Any" : `${r}+`}
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Rating filter will work after API sends rating.
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ p, baseUrl }) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    p.product_type === "variable" && p.variants?.length ? p.variants[0].id : null
  );

  const selectedVariant = useMemo(() => {
    if (p.product_type !== "variable") return null;
    return (p.variants || []).find((v) => v.id === selectedVariantId) || null;
  }, [p, selectedVariantId]);

  const priceInfo = getProductPriceInfo(p);

  const isVariable = p.product_type === "variable";
  const imageUrl = isVariable && selectedVariant?.image_path
    ? getVariantImageUrl(selectedVariant, baseUrl)
    : getFeaturedImageUrl(p, baseUrl);

  const shortText = stripHtml(p.short_description) || stripHtml(p.description);

  return (
    <article className="border border-gray-300 bg-white rounded-2xl soft-card overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-gray-300 relative">
        <button className="absolute right-4 top-4 w-9 h-9 rounded-full bg-white border border-gray-300 flex items-center justify-center">
          ❤
        </button>

        <div className="h-40 rounded-xl border border-gray-300 bg-white flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={p.name}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          ) : (
            <div className="text-xs text-slate-500">No image</div>
          )}
        </div>

        {/* type badge */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] rounded-full border border-gray-300 bg-white px-2 py-1 font-extrabold">
            {isVariable ? "VARIABLE" : "SIMPLE"}
          </span>

          {isVariable && p.variants?.length ? (
            <span className="text-[11px] text-slate-600 font-bold">
              {p.variants.length} variants
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-4">
        <div className="font-extrabold mt-1 line-clamp-2">{p.name}</div>

        {shortText ? (
          <div className="mt-1 text-xs text-slate-600 line-clamp-2">{shortText}</div>
        ) : null}

        {/* Price */}
        <div className="mt-3">
          {p.product_type === "simple" ? (
            <div className="font-extrabold text-lg">
              {priceInfo.value == null ? "৳ —" : formatBDT(priceInfo.value)}
              {priceInfo.regular != null && priceInfo.value != null && priceInfo.value < priceInfo.regular ? (
                <span className="ml-2 text-sm text-slate-500 line-through">
                  {formatBDT(priceInfo.regular)}
                </span>
              ) : null}
            </div>
          ) : (
            <div className="font-extrabold text-lg">
              {priceInfo.min == null ? "৳ —" : `${formatBDT(priceInfo.min)} - ${formatBDT(priceInfo.max)}`}
            </div>
          )}
        </div>

        {/* Variable product professional selector */}
        {isVariable && p.variants?.length ? (
          <VariantSelector
            variants={p.variants}
            selectedVariantId={selectedVariantId}
            setSelectedVariantId={setSelectedVariantId}
          />
        ) : null}

        <button className="mt-4 w-full rounded-xl border border-gray-300 bg-white hover:bg-slate-50 font-bold py-2.5">
          View Details
        </button>
      </div>
    </article>
  );
}

function VariantSelector({ variants, selectedVariantId, setSelectedVariantId }) {
  // try to infer a main attribute key like "Size"
  const mainKey = useMemo(() => {
    const keys = Object.keys(variants?.[0]?.attributes || {});
    return keys[0] || null;
  }, [variants]);

  return (
    <div className="mt-4 border border-gray-200 rounded-xl p-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-extrabold text-slate-700">
          {mainKey ? `${mainKey}:` : "Variants"}
        </div>
        <div className="text-[11px] text-slate-500">
          Select one
        </div>
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
              title={label}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Variant price/stock row */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-gray-200 bg-slate-50 p-2">
          <div className="text-slate-500 font-bold">Price</div>
          <div className="font-extrabold">
            {(() => {
              const v = variants.find((x) => x.id === selectedVariantId);
              if (!v) return "৳ —";
              const sale = v.sale_price != null ? Number(v.sale_price) : null;
              const regular = v.regular_price != null ? Number(v.regular_price) : null;
              const value = sale != null && !Number.isNaN(sale) ? sale : regular;
              return value == null ? "৳ —" : formatBDT(value);
            })()}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-slate-50 p-2">
          <div className="text-slate-500 font-bold">Stock</div>
          <div className="font-extrabold">
            {(() => {
              const v = variants.find((x) => x.id === selectedVariantId);
              const st = v?.stock;
              return st == null ? "—" : st;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}