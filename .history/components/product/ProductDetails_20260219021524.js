"use client";

import { useState } from "react";

export default function ProductDetails() {
  const [size, setSize] = useState("M");
  const [color, setColor] = useState("black");

  const colors = [
    { key: "black", class: "bg-black" },
    { key: "red", class: "bg-red-600" },
    { key: "blue", class: "bg-blue-600" },
  ];

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* TOP GRID */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* LEFT: Gallery */}
          <div>
            {/* Main Image */}
            <div className="rounded-lg border bg-white p-3">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-slate-100">
                {/* Replace with <Image/> later */}
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                  Main Product Image (16:9)
                </div>

                {/* Diagonal dashed line (like your screenshot reference) */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-[-10%] top-[60%] w-[140%] border-t-2 border-dashed border-sky-400 rotate-[-15deg]" />
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <button className="rounded-md border bg-white p-2 hover:shadow-sm">
                <div className="aspect-[16/9] w-full rounded bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                  Thumbnail 1
                </div>
              </button>

              <button className="rounded-md border bg-white p-2 hover:shadow-sm">
                <div className="aspect-[16/9] w-full rounded bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                  Thumbnail 2
                </div>
              </button>
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div>
            {/* Breadcrumb */}
            <div className="text-xs text-slate-500 mb-1">Shoe</div>

            <h1 className="text-2xl font-extrabold text-slate-900">
              Shoe Class 1
            </h1>

            {/* Price + availability */}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold">৳ 200</span>
                <span className="text-sm text-red-500 line-through">৳400</span>
              </div>

              <div className="text-sm text-slate-600">
                <span className="font-semibold">Availability:</span>{" "}
                <span className="text-emerald-700">In Stock</span>
              </div>
            </div>

            {/* Product Description label */}
            <div className="mt-4 text-sm font-semibold text-slate-800">
              Product Description:
            </div>

            {/* Choose Size */}
            <div className="mt-4">
              <div className="text-sm font-semibold text-slate-800">
                Choose Size:
              </div>

              <div className="mt-2 flex gap-2">
                {["M", "L", "XL"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={[
                      "h-8 px-3 rounded border text-sm font-semibold",
                      size === s
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Choose Color */}
            <div className="mt-4">
              <div className="text-sm font-semibold text-slate-800">
                Choose Color:
              </div>

              <div className="mt-2 flex items-center gap-3">
                {colors.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setColor(c.key)}
                    className={[
                      "h-7 w-10 rounded border",
                      c.class,
                      color === c.key ? "ring-2 ring-slate-900 ring-offset-2" : "",
                    ].join(" ")}
                    aria-label={c.key}
                  />
                ))}
              </div>

              <div className="mt-2 text-xs text-slate-600">
                Selected: <span className="font-semibold">{color}</span>
              </div>
            </div>

            {/* Big red add to cart */}
            <button className="mt-5 w-full rounded-md bg-red-800 hover:bg-red-900 text-white font-bold py-3 flex items-center justify-center gap-2">
              <span className="text-lg">🛒</span>
              কার্টে যোগ দিন ডেলিভারিতে অর্ডার করুন
            </button>

            {/* 2 buttons row */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button className="rounded-md bg-black hover:bg-slate-900 text-white font-bold py-3">
                কাস্ট দেখুন
              </button>
              <button className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3">
                অর্ডার করুন
              </button>
            </div>

            {/* WhatsApp / Messenger */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button className="rounded-md bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 flex items-center justify-center gap-2">
                <span>🟢</span> WhatsApp
              </button>
              <button className="rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 flex items-center justify-center gap-2">
                <span>💬</span> Messenger
              </button>
            </div>
          </div>
        </div>

        {/* DISCLAIMER BOX */}
        <div className="mt-8 rounded-lg border bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-7 w-7 rounded-full border flex items-center justify-center text-slate-700">
              i
            </div>
            <div>
              <div className="font-bold text-slate-900">Product Disclaimer</div>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                ছবি/ডিজাইন বোঝানোর জন্য। ডেলিভারি সময়ে পণ্যের রঙ/ডিজাইনে সামান্য
                পার্থক্য হতে পারে এবং পণ্যের সাইজিং সামান্য ভিন্ন হতে পারে।
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                জরুরি প্রয়োজনে কল করুন:{" "}
                <span className="font-extrabold">+8809XXX-149449</span>
              </p>
            </div>
          </div>
        </div>

        {/* 3 Feature Cards */}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="rounded-lg border bg-white p-6 text-center">
            <div className="text-2xl">🚚</div>
            <div className="mt-2 font-extrabold">Fast Shipping</div>
          </div>

          <div className="rounded-lg border bg-white p-6 text-center">
            <div className="text-2xl">🛡️</div>
            <div className="mt-2 font-extrabold">Secure Payment</div>
            <div className="text-xs text-slate-500 mt-1">100% Protected</div>
          </div>

          <div className="rounded-lg border bg-white p-6 text-center">
            <div className="text-2xl">↩️</div>
            <div className="mt-2 font-extrabold">Easy Returns</div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-6 rounded-lg border bg-white p-6">
          <h2 className="text-xl font-extrabold">Description</h2>
          <p className="mt-3 text-sm text-slate-600">ss</p>
        </div>
      </div>
    </div>
  );
}
