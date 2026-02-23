"use client";

import { useEffect, useMemo, useState } from "react";
import { apiAddProductReview, apiProductReviews } from "@/lib/reviews";

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
        className="px-3 py-2 border rounded disabled:opacity-50 border-gray-300"
        disabled={current <= 1}
        onClick={() => onPage(current - 1)}
      >
        Prev
      </button>

      <div className="text-sm">
        Page <b>{current}</b> / {last}
      </div>

      <button
        className="px-3 py-2 border rounded disabled:opacity-50 border-gray-300"
        disabled={current >= last}
        onClick={() => onPage(current + 1)}
      >
        Next
      </button>
    </div>
  );
}

export default function ProductReviewsBlock({ productId }) {
  // reviews payload from API
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // form
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    rating: 5,
    comment: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const reviews = payload?.data; // paginator
  const stats = payload?.stats;

  const avgRounded = useMemo(() => {
    return Math.round(Number(stats?.avg_rating || 0));
  }, [stats]);

  const load = async (page = 1) => {
    try {
      setLoading(true);
      setErr("");
      const res = await apiProductReviews(productId, page);
      setPayload(res);
    } catch (e) {
      setErr(e?.message || "Failed to load reviews");
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

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setToast(null);

    try {
      const body = {
        customer_name: form.customer_name,
        customer_email: form.customer_email ? form.customer_email : null,
        rating: Number(form.rating),
        comment: form.comment ? form.comment : null,
      };

      const res = await apiAddProductReview(productId, body);

      setToast({
        type: "success",
        text:
          res?.message ||
          "Review submitted successfully! It will appear after approval.",
      });

      setForm({
        customer_name: "",
        customer_email: "",
        rating: 5,
        comment: "",
      });

      // public reviews are usually not approved instantly -> no need to reload list
      // if you auto-approve on backend then call: load(1)
    } catch (e) {
      setToast({ type: "error", text: e?.message || "Failed to submit review" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <h2 className="text-2xl font-extrabold text-center">Reviews</h2>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Reviews list */}
        <div className="lg:col-span-2 bg-white border border-gray-300 rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="text-lg font-extrabold">Customer Reviews</div>
              <div className="mt-1 text-sm text-slate-600 flex items-center gap-2">
                <Stars value={avgRounded} />
                <span>
                  {Number(stats?.avg_rating || 0).toFixed(1)} / 5 •{" "}
                  {stats?.total_reviews || 0} Reviews
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-sm text-slate-600">Loading reviews...</div>
          ) : err ? (
            <div className="rounded-xl border border-gray-300 bg-red-50 p-4 text-sm text-red-700">
              {err}
            </div>
          ) : reviews?.data?.length ? (
            <div className="space-y-4">
              {reviews.data.map((r) => (
                <div key={r.id} className="border border-gray-300 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold">{r.customer_name}</div>
                      {r.customer_email ? (
                        <div className="text-xs text-slate-500">
                          {r.customer_email}
                        </div>
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

        {/* Review form */}
        <div className="bg-white border border-gray-300 rounded-2xl p-5">
          <div className="text-lg font-extrabold mb-3">Write a Review</div>

          {toast ? (
            <div
              className={[
                "mb-3 rounded-xl p-3 text-sm border border-gray-300",
                toast.type === "success"
                  ? "bg-green-50 text-green-700 border-gray-300"
                  : "bg-red-50 text-red-700 border-gray-300",
              ].join(" ")}
            >
              {toast.text}
            </div>
          ) : null}

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-sm font-bold">Your Name *</label>
              <input
                className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                value={form.customer_name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, customer_name: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <label className="text-sm font-bold">Email (optional)</label>
              <input
                type="email"
                className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                value={form.customer_email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, customer_email: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-bold">Rating *</label>
              <select
                className="w-full mt-1 border  border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                value={form.rating}
                onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))}
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Good</option>
                <option value={3}>3 - Average</option>
                <option value={2}>2 - Poor</option>
                <option value={1}>1 - Bad</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold">Comment</label>
              <textarea
                className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200 min-h-[110px]"
                value={form.comment}
                onChange={(e) =>
                  setForm((p) => ({ ...p, comment: e.target.value }))
                }
              />
            </div>

            <button
              disabled={submitting}
              className="w-full rounded-xl bg-emerald-600 text-white py-2.5 font-extrabold hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>

            <p className="text-xs text-slate-500">
              Your review will appear after approval.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}