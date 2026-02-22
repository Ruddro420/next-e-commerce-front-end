/* eslint-disable react/no-unescaped-entities */
"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import SectionTitle from "@/components/ui/SectionTitle";
import Link from "next/link";

export default function FeaturedBrand() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds
  const TIMEOUT_DURATION = 10000; // 10 seconds

  const fetchBrands = useCallback(async () => {
    if (!baseUrl) {
      setError("API base URL is not configured");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

      // ✅ your route: Route::get('brands', ...)
      const res = await fetch(`${baseUrl}/api/brands`, {
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();

      /**
       * Support: [] OR {brands: []} OR {data: []}
       * (depending on your controller response)
       */
      const list =
        (Array.isArray(data) && data) ||
        (Array.isArray(data?.brands) && data.brands) ||
        (Array.isArray(data?.data) && data.data) ||
        [];

      setBrands(list);
      setError(null);
      setRetryCount(0);
    } catch (err) {
      console.error("Failed to fetch brands:", err);

      let errorMessage = "Failed to load brands";
      if (err?.name === "AbortError") {
        errorMessage = "Request timeout. The server is taking too long to respond.";
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      // Auto retry logic
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => setRetryCount((prev) => prev + 1), RETRY_DELAY);
      }
    } finally {
      setLoading(false);
    }
  }, [baseUrl, retryCount]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands, retryCount]);

  const handleManualRetry = () => setRetryCount((prev) => prev + 1);

  if (loading && brands.length === 0) {
    return (
      <section>
        <SectionTitle
          title="Featured Brand"
          subtitle="Choose Your Favorite Brand & Explore Products!"
        />

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl soft-card p-4 animate-pulse">
              <div className="w-full h-20 bg-gray-200 rounded-lg" />
              <div className="mt-2 h-4 bg-gray-200 rounded w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error && brands.length === 0) {
    return (
      <section>
        <SectionTitle
          title="Featured Brand"
          subtitle="Choose Your Favorite Brand & Explore Products!"
        />

        <div className="mt-6 text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>

          <div className="space-x-4">
            <button
              onClick={handleManualRetry}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Try Again
            </button>

            {retryCount < MAX_RETRIES && retryCount > 0 && (
              <span className="text-gray-500">
                Auto retrying... ({retryCount}/{MAX_RETRIES})
              </span>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionTitle
        title="Featured Brand"
        subtitle="Choose Your Favorite Brand & Explore Products!"
      />

      {error && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex justify-between items-center">
          <p className="text-yellow-700 text-sm">
            Some brands couldn't be loaded. {error}
          </p>
          <button
            onClick={handleManualRetry}
            className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {brands.map((b) => {
          // ✅ try multiple possible fields for brand image
          const imgPath =
            b?.image_path || b?.logo_path || b?.logo || b?.image || null;

          const imgSrc = imgPath
            ? `${baseUrl}/storage/${imgPath}`
            : "/placeholder.png"; // put any placeholder you have

          return (
            <Link
              key={b.id}
              href={`/brand/${b.slug}`} // ✅ your products route uses slug
              className="bg-white rounded-2xl soft-card p-4 hover:-translate-y-0.5 transition"
            >
              <div className="w-full h-20 flex items-center justify-center">
                <Image
                  src={imgSrc}
                  alt={b.name}
                  width={90}
                  height={90}
                  className="h-full object-contain"
                  unoptimized
                />
              </div>

              <div className="mt-2 text-sm font-semibold text-center line-clamp-2">
                {b.name}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}