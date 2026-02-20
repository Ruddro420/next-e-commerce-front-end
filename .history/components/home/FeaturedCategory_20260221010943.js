"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import SectionTitle from "@/components/ui/SectionTitle";

export default function FeaturedCategory() {
  const [categories, setCategories] = useState([]);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(`${baseUrl}/api/categories`, { cache: "no-store" });
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    }
    if (baseUrl) loadCategories();
  }, [baseUrl]);

  return (
    <section>
      <SectionTitle
        title="Featured Category"
        subtitle="Get Your Desired Product from Featured Category!"
      />

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((c) => {
          const imgSrc = `${baseUrl}/storage/${c.image_path}`;

          return (
            <a
              key={c.id}
              href={`/category/${c.slug}`}
              className="bg-white rounded-2xl soft-card p-4 hover:-translate-y-0.5 transition"
            >
              <div className="w-full h-20 flex items-center justify-center">
                <Image
                  src={imgSrc}
                  alt={c.name}
                  width={80}
                  height={80}
                  className="h-full object-contain"
                  unoptimized
                />
              </div>

              <div className="mt-2 text-sm font-semibold text-center line-clamp-2">
                {c.name}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}