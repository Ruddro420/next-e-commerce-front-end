"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "@/components/ui/Container";

export default function CategoryNav() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const pathname = usePathname();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const res = await fetch(`${baseUrl}/api/categories`, {
          cache: "no-store",
        });
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

  // ✅ Active link styling (supports nested routes)
  const linkClass = (href) => {
    const isActive =
      href === "/"
        ? pathname === "/"
        : pathname.startsWith(href);

    return `
      relative flex items-center gap-2 whitespace-nowrap
      text-md font-semibold transition-all duration-200
      ${
        isActive
          ? "text-emerald-700 after:absolute after:-bottom-2 after:left-0 after:w-full after:h-[2px] after:bg-emerald-700"
          : "text-slate-600 hover:text-slate-900"
      }
    `;
  };

  return (
    <nav className="bg-white border-b border-gray-300">
      <Container className="py-3 flex items-center gap-6 overflow-x-auto scrollbar-hide">
        {loading ? (
          <div className="text-sm text-slate-500">
            Loading categories...
          </div>
        ) : (
          <>
            {/* Home */}
            <Link href="/" className={linkClass("/")}>
              Home
            </Link>

            {/* Shop */}
            <Link href="/shop" className={linkClass("/shop")}>
              Shop
            </Link>

            {/* Dynamic Categories */}
            {categories.map((c) => {
              const href = `/category/${c.id}`;
              return (
                <Link
                  key={c.id}
                  href={href}
                  className={linkClass(href)}
                >
                  {c.name}
                </Link>
              );
            })}

            {/* View All Button */}
            <Link
              href="/shop"
              className="ml-auto rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-sm font-semibold whitespace-nowrap hover:bg-amber-200 transition"
            >
              View All
            </Link>
          </>
        )}
      </Container>
    </nav>
  );
}