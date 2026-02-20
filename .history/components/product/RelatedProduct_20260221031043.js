"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";

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
  const [items, setItems] = useState([]);

  useEffect(() => {
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
    const t = setTimeout(() => controller.abort(), 12000);

    async function load() {
      try {
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
      } catch (e) {
        setError(e?.name === "AbortError" ? "Request timeout" : e.message);
        setItems([]);
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
  }, [baseUrl, productId]);

  return (
    <section>
      <div className="flex items-center gap-4 mb-5">
        <div className="h-px flex-1 bg-slate-200" />
        <h2 className="text-2xl font-extrabold">{title}</h2>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

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
        <div className="text-sm text-slate-500">No related products found.</div>
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