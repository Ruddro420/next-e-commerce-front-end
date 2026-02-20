"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "@/components/ui/Container";

export default function CategoryPage({ categoryId }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // show what's coming in
    console.log("BASE URL:", baseUrl);
    console.log("CATEGORY ID:", categoryId);

    if (!baseUrl) {
      setError("NEXT_PUBLIC_API_BASE_URL is missing. Restart dev server after setting .env.local");
      setLoading(false);
      return;
    }

    if (!categoryId) {
      setError("categoryId is missing. Check your route param (folder name should be [id])");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    async function load() {
      try {
        setLoading(true);
        setError("");

        const url = `${baseUrl}/api/categories/${categoryId}/products`;
        console.log("Fetching:", url);

        const res = await fetch(url, { cache: "no-store", signal: controller.signal });

        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        setCategory(data?.category || null);
        setProducts(Array.isArray(data?.products) ? data.products : []);
      } catch (e) {
        console.error(e);
        setError(e.name === "AbortError" ? "Request timed out (API not reachable)" : e.message);
        setCategory(null);
        setProducts([]);
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    }

    load();

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [baseUrl, categoryId]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <Container className="py-8">
        <div className="text-xs text-slate-500">Category</div>
        <h1 className="text-2xl md:text-3xl font-extrabold capitalize">
          {category?.name || "Category"}
        </h1>

        {loading ? <p className="mt-2 text-sm text-slate-600">Loading...</p> : null}

        {!loading && error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {!loading && !error ? (
          <p className="mt-2 text-sm text-slate-600">{products.length} products found</p>
        ) : null}

        {!loading && !error ? (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => (
              <div key={p.id} className="border border-gray-300 bg-white rounded-2xl p-4">
                <div className="font-extrabold">{p.name}</div>
                <div className="text-xs text-slate-500 mt-1">{p.product_type}</div>
              </div>
            ))}
          </div>
        ) : null}
      </Container>
    </div>
  );
}