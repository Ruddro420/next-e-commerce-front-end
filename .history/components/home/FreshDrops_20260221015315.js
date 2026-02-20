"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "@/components/ui/Container";
import { Heart, ShoppingCart } from "lucide-react";

function formatBDT(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return "৳ —";
  return `৳ ${num.toLocaleString("en-US")}`;
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

function priceForSimple(p) {
  const sale = p.sale_price != null ? Number(p.sale_price) : null;
  const regular = p.regular_price != null ? Number(p.regular_price) : null;

  if (sale != null && !Number.isNaN(sale)) return { value: sale, regular };
  if (regular != null && !Number.isNaN(regular)) return { value: regular, regular: null };
  return { value: null, regular: null };
}

function priceForVariant(v) {
  const sale = v.sale_price != null ? Number(v.sale_price) : null;
  const regular = v.regular_price != null ? Number(v.regular_price) : null;
  if (sale != null && !Number.isNaN(sale)) return { value: sale, regular };
  if (regular != null && !Number.isNaN(regular)) return { value: regular, regular: null };
  return { value: null, regular: null };
}

function rangeForVariable(p) {
  const vals = (p.variants || [])
    .map((v) => {
      const pr = priceForVariant(v);
      return pr.value;
    })
    .filter((x) => x != null);

  if (!vals.length) return { min: null, max: null };
  return { min: Math.min(...vals), max: Math.max(...vals) };
}

function storageUrl(baseUrl, path) {
  if (!path) return "";
  return `${baseUrl}/storage/${path}`;
}

function getProductImage(p, baseUrl) {
  // ignore featured_image_url localhost and build from featured_image path
  if (p.featured_image) return storageUrl(baseUrl, p.featured_image);
  if (p.featured_image_url) {
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

export default function CategoryPage({ categoryId }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);

  // UI state
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    if (!baseUrl) {
      setError("NEXT_PUBLIC_API_BASE_URL missing. Restart dev server after setting .env.local");
      setLoading(false);
      return;
    }
    if (!categoryId && categoryId !== 0) {
      setError("categoryId missing from route params");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 12000);

    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${baseUrl}/api/categories/${categoryId}/products`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);

        const data = await res.json();
        setCategory(data?.category || null);
        setProducts(Array.isArray(data?.products) ? data.products : []);
      } catch (e) {
        setError(e?.name === "AbortError" ? "Request timeout (API not reachable)" : e.message);
        setCategory(null);
        setProducts([]);
      } finally {
        clearTimeout(t);
        setLoading(false);
      }
    }

    load();

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [baseUrl, categoryId]);

  const sortedProducts = useMemo(() => {
    const list = [...products];

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
  }, [products, sort]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <Container className="py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">Category</div>
            <h1 className="text-2xl md:text-3xl font-extrabold capitalize">
              {category?.name || "Category"}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {loading ? "Loading..." : `${sortedProducts.length} products found`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
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

        {error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {/* Products */}
        <section className="mt-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
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
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {sortedProducts.map((p) => (
                <CategoryProductCard key={p.id} p={p} baseUrl={baseUrl} />
              ))}
            </div>
          )}
        </section>
      </Container>
    </div>
  );
}

/* ============ CARD (FreshDrops style) ============ */

function CategoryProductCard({ p, baseUrl }) {
  const isVariable = p.product_type === "variable";
  const [selectedVariantId, setSelectedVariantId] = useState(
    isVariable && p.variants?.length ? p.variants[0].id : null
  );

  const selectedVariant = useMemo(() => {
    if (!isVariable) return null;
    return (p.variants || []).find((v) => v.id === selectedVariantId) || null;
  }, [isVariable, p, selectedVariantId]);

  // image
  const imgSrc = isVariable && selectedVariant?.image_path
    ? getVariantImage(selectedVariant, baseUrl)
    : getProductImage(p, baseUrl);

  // price display
  const priceNode = useMemo(() => {
    if (!isVariable) {
      const pr = priceForSimple(p);
      return (
        <div className="mt-2 font-extrabold">
          {pr.value == null ? "৳ —" : formatBDT(pr.value)}
          {pr.regular != null && pr.value != null && pr.value < pr.regular ? (
            <span className="ml-2 text-sm text-slate-500 line-through">{formatBDT(pr.regular)}</span>
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
            <span className="ml-2 text-sm text-slate-500 line-through">{formatBDT(pr.regular)}</span>
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

  const shortText = stripHtml(p.short_description) || stripHtml(p.description);

  return (
    <article className="bg-white rounded-2xl soft-card overflow-hidden h-full flex flex-col">
      <div className="relative p-5 bg-[#FAF8F6]">
        <button className="cursor-pointer absolute right-4 top-4 w-9 h-9 rounded-full bg-white border border-gray-300 flex items-center justify-center">
          <Heart className="w-5 h-5" />
        </button>

        {/* fixed height like FreshDrops */}
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

        {/* badges */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] rounded-full border border-gray-300 bg-white px-2 py-1 font-extrabold">
            {isVariable ? "VARIABLE" : "SIMPLE"}
          </span>
          {isVariable ? (
            <span className="text-[11px] text-slate-600 font-bold">{p.variants?.length || 0} variants</span>
          ) : null}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="font-bold leading-snug line-clamp-2">{p.name}</div>

        {shortText ? (
          <div className="text-sm text-slate-500 mt-1 line-clamp-2">{shortText}</div>
        ) : (
          <div className="text-sm text-slate-500 mt-1 line-clamp-1">
            SKU: <span className="font-semibold">{p.sku || "—"}</span>
          </div>
        )}

        {priceNode}

        {/* Variant selector */}
        {isVariable && p.variants?.length ? (
          <VariantRow
            variants={p.variants}
            selectedVariantId={selectedVariantId}
            setSelectedVariantId={setSelectedVariantId}
          />
        ) : (
          <div className="text-xs text-slate-500 mt-2">
            Stock: <span className="font-bold text-slate-700">{p.stock ?? "—"}</span>
          </div>
        )}

        <button className="cursor-pointer mt-4 w-full rounded-md border-2 border-[#008159] text-[#008159] font-bold py-2.5 text-sm hover:bg-[#008159] hover:text-white">
          <ShoppingCart className="inline mr-2 w-5 h-5" />
          কার্টে যুক্ত করুন
        </button>
      </div>
    </article>
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

      <div className="mt-2 text-xs text-slate-500">
        (Click variant to change image & price)
      </div>
    </div>
  );
}