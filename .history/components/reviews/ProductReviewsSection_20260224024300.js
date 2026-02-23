"use client";

import { useEffect, useState } from "react";
import { apiProductReviews } from "@/lib/reviews";

function Stars({ value }) {
  const v = Math.max(0, Math.min(5, Number(value || 0)));
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < v ? "text-yellow-500" : "text-gray-300"}>
          ★
        </span>
      ))}
    </div>
  );
}

function Pagination({ meta, onPage }) {
  if (!meta) return null;
  const current = meta.current_page;
  const last = meta.last_page;
  if (!last || last <= 1) return null;

  return (
    <div className="flex items-center gap-2 mt-6">
      <button
        className="px-3 py-2 border rounded disabled:opacity-50"
        disabled={current <= 1}
        onClick={() => onPage(current - 1)}
      >
        Prev
      </button>

      <div className="text-sm">
        Page <b>{current}</b> / {last}
      </div>

      <button
        className="px-3 py-2 border rounded disabled:opacity-50"
        disabled={current >= last}
        onClick={() => onPage(current + 1)}
      >
        Next
      </button>
    </div>
  );
}

export default function ProductReviewsSection({ productId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState(null); // full api response

  const load = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const res = await apiProductReviews(productId, { page });
      setPayload(res);
    } catch (e) {
      setError(e?.message || "Failed to load reviews");
      setPayload(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!productId) return;
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const reviews = payload?.data; // paginator
  const stats = payload?.stats;

  return (
    <div className="border rounded-2xl p-5 bg-white">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-extrabold">Customer Reviews</h3>
          <div className="mt-1 text-sm text-slate-600 flex items-center gap-2">
            <Stars value={Math.round(Number(stats?.avg_rating || 0))} />
            <span>
              {Number(stats?.avg_rating || 0).toFixed(1)} / 5 •{" "}
              {stats?.total_reviews || 0} Reviews
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-slate-600">Loading reviews...</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : reviews?.data?.length ? (
        <div className="space-y-4">
          {reviews.data.map((r) => (
            <div key={r.id} className="border rounded-xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold">{r.customer_name}</div>
                  {r.customer_email ? (
                    <div className="text-xs text-slate-500">{r.customer_email}</div>
                  ) : null}
                </div>
                <Stars value={r.rating} />
              </div>

              {r.comment ? (
                <p className="text-sm text-slate-700 mt-2 whitespace-pre-line">
                  {r.comment}
                </p>
              ) : (
                <p className="text-sm text-slate-400 mt-2">No comment</p>
              )}

              <div className="text-xs text-slate-400 mt-2">
                {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
              </div>
            </div>
          ))}

          <Pagination meta={reviews} onPage={load} />
        </div>
      ) : (
        <div className="text-sm text-slate-600">No reviews yet.</div>
      )}
    </div>
  );
}