"use client";

import { useState } from "react";
import { apiSubmitProductReview } from "@/lib/reviews";

export default function ReviewForm({ productId, onSubmitted }) {
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    rating: 5,
    comment: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setToast(null);

    try {
      const payload = {
        customer_name: form.customer_name,
        customer_email: form.customer_email ? form.customer_email : null,
        rating: Number(form.rating),
        comment: form.comment ? form.comment : null,
      };

      const res = await apiSubmitProductReview(productId, payload);

      setToast({
        type: "success",
        text: res?.message || "Review submitted! It will appear after approval.",
      });

      setForm({
        customer_name: "",
        customer_email: "",
        rating: 5,
        comment: "",
      });

      if (onSubmitted) onSubmitted(res);
    } catch (err) {
      setToast({ type: "error", text: err?.message || "Failed to submit review" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border rounded-2xl p-5 bg-white">
      <h3 className="text-lg font-extrabold mb-3">Write a Review</h3>

      {toast ? (
        <div
          className={[
            "mb-3 rounded-xl p-3 text-sm border",
            toast.type === "success"
              ? "bg-green-50 text-green-700 border-green-100"
              : "bg-red-50 text-red-700 border-red-100",
          ].join(" ")}
        >
          {toast.text}
        </div>
      ) : null}

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-sm font-bold">Your Name *</label>
          <input
            className="w-full mt-1 border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
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
            className="w-full mt-1 border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
            value={form.customer_email}
            onChange={(e) =>
              setForm((p) => ({ ...p, customer_email: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="text-sm font-bold">Rating *</label>
          <select
            className="w-full mt-1 border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
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
            className="w-full mt-1 border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200 min-h-[110px]"
            value={form.comment}
            onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
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
  );
}