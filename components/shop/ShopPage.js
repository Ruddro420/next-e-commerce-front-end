"use client";

import { useMemo, useState } from "react";
import Container from "@/components/ui/Container";

const PRODUCTS = Array.from({ length: 18 }).map((_, i) => ({
  id: `p${i + 1}`,
  name: `Product ${i + 1}`,
  price: 199 + i * 25,
  category: i % 3 === 0 ? "Shoe" : i % 3 === 1 ? "Gadget" : "Skincare",
}));

function formatBDT(n) {
  return `৳ ${n.toLocaleString("en-US")}`;
}

export default function ShopPage() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(q.toLowerCase())
    );

    if (sort === "price_low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_high") list = [...list].sort((a, b) => b.price - a.price);

    return list;
  }, [q, sort]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <Container className="py-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">Shop</h1>
            <p className="text-sm text-slate-600 mt-1">Browse all products and discover new arrivals.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="w-full sm:w-72 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            />
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

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>

        {/* Pagination UI */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <button className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50">
            Prev
          </button>
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              className={`rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 ${
                n === 1 ? "bg-slate-900 text-white" : "bg-white"
              }`}
            >
              {n}
            </button>
          ))}
          <button className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50">
            Next
          </button>
        </div>
      </Container>
    </div>
  );
}

function ProductCard({ p }) {
  return (
    <article className="border border-gray-300 bg-white rounded-2xl soft-card overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-gray-300 relative">
        <button className="absolute right-4 top-4 w-9 h-9 rounded-full bg-white border border-gray-300 flex items-center justify-center">
          ❤
        </button>
        <div className="h-36 rounded-xl border border-gray-300 bg-white flex items-center justify-center text-xs text-slate-500">
          Image
        </div>
      </div>

      <div className="p-4">
        <div className="text-xs text-slate-500">{p.category}</div>
        <div className="font-extrabold mt-1 line-clamp-2">{p.name}</div>
        <div className="mt-2 font-extrabold">{formatBDT(p.price)}</div>

        <button className="mt-3 w-full rounded-xl border border-gray-300 bg-white hover:bg-slate-50 font-bold py-2.5">
          View Details
        </button>
      </div>
    </article>
  );
}
