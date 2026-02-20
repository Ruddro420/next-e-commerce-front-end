"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";

export default function CategoryNav() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const res = await fetch(`${baseUrl}/api/categories`, { cache: "no-store" });
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("CategoryNav fetch failed:", e);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    if (baseUrl) loadCategories();
  }, [baseUrl]);

  return (
    <nav className="bg-white">
      <Container className="py-2 flex items-center gap-4 overflow-x-auto">
        {loading ? (
          <div className="text-sm text-slate-500">Loading categories...</div>
        ) : (
          <>
            <Link
              key={c.id}
              href={`/category/${c.id}`}
              className="flex items-center gap-2 whitespace-nowrap text-md text-slate-600 hover:text-slate-900"
            >
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={c.name}
                  className="w-6 h-6 rounded-full object-cover border border-gray-200"
                  loading="lazy"
                />
              ) : null}
              <span className="font-semibold">{c.name}</span>
            </Link>
            {categories.map((c) => {
              const imgSrc = c.image_path ? `${baseUrl}/storage/${c.image_path}` : null;

              return (
                <Link
                  key={c.id}
                  href={`/category/${c.id}`}
                  className="flex items-center gap-2 whitespace-nowrap text-md text-slate-600 hover:text-slate-900"
                >
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={c.name}
                      className="w-6 h-6 rounded-full object-cover border border-gray-200"
                      loading="lazy"
                    />
                  ) : null}
                  <span className="font-semibold">{c.name}</span>
                </Link>
              );
            })}

            {/* Optional pill button (you can remove if not needed) */}
            <Link
              href="/shop"
              className="ml-auto rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-sm font-semibold whitespace-nowrap"
            >
              View All
            </Link>
          </>
        )}
      </Container>
    </nav>
  );
}