"use client";

import { useMemo, useState } from "react";
import Container from "@/components/ui/Container";

const ALL = [
  { id: "1", name: "Shoe Class 1", category: "shoe", price: 200, brand: "Apex", rating: 4 },
  { id: "2", name: "Shoe Class 2", category: "shoe", price: 350, brand: "Bata", rating: 5 },
  { id: "3", name: "Earbuds Pro", category: "gadget", price: 1299, brand: "Anker", rating: 4 },
  { id: "4", name: "Smart Watch", category: "gadget", price: 1899, brand: "Xiaomi", rating: 3 },
  { id: "5", name: "Face Cleanser", category: "skincare", price: 499, brand: "COSRX", rating: 5 },
  { id: "6", name: "Moisturizer", category: "skincare", price: 799, brand: "Purito", rating: 4 },
];

function formatBDT(n) {
  return `৳ ${n.toLocaleString("en-US")}`;
}

export default function CategoryPage({ slug }) {
  const [openFilter, setOpenFilter] = useState(false);
  const [sort, setSort] = useState("newest");

  // filters
  const [priceMax, setPriceMax] = useState(2000);
  const [brands, setBrands] = useState([]);
  const [rating, setRating] = useState(0);

  const allBrands = useMemo(() => {
    const list = ALL.filter((p) => p.category === slug).map((p) => p.brand);
    return Array.from(new Set(list));
  }, [slug]);

  const filtered = useMemo(() => {
    let list = ALL.filter((p) => p.category === slug);
    list = list.filter((p) => p.price <= priceMax);
    if (brands.length) list = list.filter((p) => brands.includes(p.brand));
    if (rating > 0) list = list.filter((p) => p.rating >= rating);

    if (sort === "price_low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_high") list = [...list].sort((a, b) => b.price - a.price);

    return list;
  }, [slug, priceMax, brands, rating, sort]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <Container className="py-8">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">Category</div>
            <h1 className="text-2xl md:text-3xl font-extrabold capitalize">{slug}</h1>
            <p className="text-sm text-slate-600 mt-1">{filtered.length} products found</p>
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
              allBrands={allBrands}
              brands={brands}
              setBrands={setBrands}
              rating={rating}
              setRating={setRating}
            />
          </aside>

          {/* Products */}
          <section className="lg:col-span-3">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>

            {/* Bottom info bar */}
            <div className="mt-8 border border-gray-300 rounded-2xl bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-slate-600">
                Showing <span className="font-bold">{filtered.length}</span> items
              </div>
              <div className="flex gap-2">
                <button className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                  Prev
                </button>
                <button className="rounded-lg border border-gray-300 bg-slate-900 text-white px-3 py-2 text-sm font-semibold">
                  1
                </button>
                <button className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                  2
                </button>
                <button className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                  Next
                </button>
              </div>
            </div>
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
                allBrands={allBrands}
                brands={brands}
                setBrands={setBrands}
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

function FilterPanel({ priceMax, setPriceMax, allBrands, brands, setBrands, rating, setRating }) {
  const toggleBrand = (b) => {
    setBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  };

  const clearAll = () => {
    setPriceMax(2000);
    setBrands([]);
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
            max="5000"
            step="50"
            value={priceMax}
            onChange={(e) => setPriceMax(parseInt(e.target.value, 10))}
            className="mt-3 w-full"
          />
        </div>

        {/* Brand */}
        <div>
          <div className="font-extrabold text-sm">Brand</div>
          <div className="mt-3 space-y-2">
            {allBrands.map((b) => (
              <label key={b} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={brands.includes(b)}
                  onChange={() => toggleBrand(b)}
                  className="h-4 w-4"
                />
                <span className="text-slate-700">{b}</span>
              </label>
            ))}
            {!allBrands.length ? (
              <div className="text-sm text-slate-500">No brands found</div>
            ) : null}
          </div>
        </div>

        {/* Rating */}
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
        </div>
      </div>
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
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500 capitalize">{p.category}</div>
          <span className="text-xs rounded-full border border-gray-300 bg-white px-2 py-1 font-bold">
            ⭐ {p.rating}
          </span>
        </div>

        <div className="font-extrabold mt-1 line-clamp-2">{p.name}</div>
        <div className="mt-2 font-extrabold">{formatBDT(p.price)}</div>

        <button className="mt-3 w-full rounded-xl border border-gray-300 bg-white hover:bg-slate-50 font-bold py-2.5">
          View Details
        </button>
      </div>
    </article>
  );
}
