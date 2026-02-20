"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import SectionTitle from "@/components/ui/SectionTitle";
import Link from "next/link";

export default function FeaturedCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  const fetchCategories = useCallback(async () => {
    if (!baseUrl) {
      setError("API base URL is not configured");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const res = await fetch(`${baseUrl}/api/categories`, {
        cache: "no-store",
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
      setError(null);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      
      let errorMessage = "Failed to load categories";
      if (err.name === 'AbortError') {
        errorMessage = "Request timeout. The server is taking too long to respond.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Auto retry logic
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, RETRY_DELAY);
      }
    } finally {
      setLoading(false);
    }
  }, [baseUrl, retryCount]);

  // Initial fetch and retry on retryCount change
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, retryCount]);

  const handleManualRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading && categories.length === 0) {
    return (
      <section>
        <SectionTitle
          title="Featured Category"
          subtitle="Get Your Desired Product from Featured Category!"
        />
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl soft-card p-4 animate-pulse">
              <div className="w-full h-20 bg-gray-200 rounded-lg"></div>
              <div className="mt-2 h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error && categories.length === 0) {
    return (
      <section>
        <SectionTitle
          title="Featured Category"
          subtitle="Get Your Desired Product from Featured Category!"
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
        title="Featured Category"
        subtitle="Get Your Desired Product from Featured Category!"
      />

      {error && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex justify-between items-center">
          <p className="text-yellow-700 text-sm">Some categories couldn't be loaded. {error}</p>
          <button
            onClick={handleManualRetry}
            className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((c) => {
          const imgSrc = `${baseUrl}/storage/${c.image_path}`;

          return (
            <Link
              key={c.id}
              href={`/category/${c.id}`}
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
            </Link>
          );
        })}
      </div>
    </section>
  );
}