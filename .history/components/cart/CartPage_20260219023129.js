/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useMemo, useState } from "react";
import Container from "@/components/ui/Container";

const initialItems = [
  {
    id: "p1",
    name: "Shoe Class 1",
    category: "Shoe",
    variant: "Premium Edition",
    size: "M",
    color: "Black",
    colorClass: "bg-black",
    price: 200,
    oldPrice: 400,
    qty: 1,
  },
  {
    id: "p2",
    name: "Wireless Earbuds Pro",
    category: "Earbuds",
    variant: "Noise Canceling",
    size: "Standard",
    color: "Blue",
    colorClass: "bg-blue-600",
    price: 1299,
    oldPrice: 1499,
    qty: 2,
  },
];

function formatBDT(amount) {
  // Simple formatting (you can localize later)
  return `৳ ${amount.toLocaleString("en-US")}`;
}

export default function CartPage() {
  const [items, setItems] = useState(initialItems);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const subtotal = useMemo(() => {
    return items.reduce((sum, i) => sum + i.price * i.qty, 0);
  }, [items]);

  const shipping = useMemo(() => {
    // Example shipping rule
    if (items.length === 0) return 0;
    return subtotal >= 3000 ? 0 : 120;
  }, [items, subtotal]);

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    // Example coupons
    if (appliedCoupon === "SAVE10") return Math.round(subtotal * 0.1);
    if (appliedCoupon === "FREESHIP") return shipping;
    return 0;
  }, [appliedCoupon, subtotal, shipping]);

  const total = useMemo(() => {
    return Math.max(subtotal + shipping - discount, 0);
  }, [subtotal, shipping, discount]);

  const updateQty = (id, nextQty) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, qty: Math.max(1, Math.min(99, nextQty)) } : it
      )
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const clearCart = () => setItems([]);

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;

    // Demo coupon validation
    if (code === "SAVE10" || code === "FREESHIP") {
      setAppliedCoupon(code);
    } else {
      setAppliedCoupon("INVALID");
      setTimeout(() => setAppliedCoupon(null), 1500);
    }
  };

  const isEmpty = items.length === 0;

  return (
    <div className="bg-slate-50">
      <Container className="py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">Your Cart</h1>
            <p className="text-sm text-slate-600 mt-1">
              Review your items, apply coupon, and proceed to checkout.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              ← Continue Shopping
            </a>
            {!isEmpty && (
              <button
                onClick={clearCart}
                className="rounded-full border border-gray-300 border border-gray-300-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {isEmpty ? (
          <EmptyState />
        ) : (
          <div className="mt-6 grid lg:grid-cols-3 gap-6">
            {/* Left: Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl bg-white border border-gray-300 soft-card overflow-hidden">
                <div className="px-5 py-4 border border-gray-300-b flex items-center justify-between">
                  <div className="font-extrabold">Cart Items</div>
                  <div className="text-sm text-slate-600">
                    {items.length} item(s)
                  </div>
                </div>

                <div className="divide-y">
                  {items.map((it) => (
                    <CartRow
                      key={it.id}
                      item={it}
                      onQty={(q) => updateQty(it.id, q)}
                      onRemove={() => removeItem(it.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Delivery Note / Trust strip */}
              <div className="rounded-2xl border border-gray-300 bg-white p-5 soft-card">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-gray-300 flex items-center justify-center">
                    🚚
                  </div>
                  <div>
                    <div className="font-extrabold">Delivery & Return</div>
                    <p className="text-sm text-slate-600 mt-1">
                      Fast delivery inside Dhaka. Easy return within 3 days if
                      the product is unused and packaging is intact.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Summary (sticky on desktop) */}
            <div className="lg:sticky lg:top-6 h-fit space-y-4">
              {/* Coupon */}
              <div className="rounded-2xl border border-gray-300 bg-white p-5 soft-card">
                <div className="font-extrabold">Coupon</div>
                <p className="text-sm text-slate-600 mt-1">
                  Try <span className="font-semibold">SAVE10</span> or{" "}
                  <span className="font-semibold">FREESHIP</span>.
                </p>

                <div className="mt-3 flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                  <button
                    onClick={applyCoupon}
                    className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-bold hover:bg-emerald-700"
                  >
                    Apply
                  </button>
                </div>

                {appliedCoupon === "INVALID" ? (
                  <div className="mt-2 text-sm text-red-600 font-semibold">
                    Invalid coupon code
                  </div>
                ) : appliedCoupon ? (
                  <div className="mt-2 text-sm text-emerald-700 font-semibold">
                    Coupon applied: {appliedCoupon}
                  </div>
                ) : null}
              </div>

              {/* Summary */}
              <div className="rounded-2xl border border-gray-300 bg-white p-5 soft-card">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold">Order Summary</div>
                  <span className="text-xs rounded-full bg-slate-100 px-2 py-1">
                    Secure Checkout
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <Row label="Subtotal" value={formatBDT(subtotal)} />
                  <Row
                    label="Shipping"
                    value={shipping === 0 ? "Free" : formatBDT(shipping)}
                    hint={subtotal >= 3000 ? "Free over ৳ 3,000" : null}
                  />
                  <Row
                    label="Discount"
                    value={discount === 0 ? "-" : `- ${formatBDT(discount)}`}
                    valueClass={discount ? "text-emerald-700" : ""}
                  />

                  <div className="pt-3 border border-gray-300-t flex items-center justify-between">
                    <div className="font-extrabold text-base">Total</div>
                    <div className="font-extrabold text-xl">
                      {formatBDT(total)}
                    </div>
                  </div>
                </div>

                <button className="mt-4 w-full rounded-xl bg-red-800 hover:bg-red-900 text-white font-extrabold py-3">
                  Proceed to Checkout
                </button>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3">
                    WhatsApp
                  </button>
                  <button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3">
                    Messenger
                  </button>
                </div>

                <div className="mt-4 text-xs text-slate-500 leading-relaxed">
                  By placing order, you agree to our Terms & Conditions and
                  Return Policy.
                </div>
              </div>

              {/* Payment badges */}
              <div className="rounded-2xl border border-gray-300 bg-white p-5 soft-card">
                <div className="font-extrabold">Why shop with us?</div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <MiniBadge icon="⚡" text="Fast" />
                  <MiniBadge icon="🔒" text="Secure" />
                  <MiniBadge icon="↩️" text="Return" />
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

function CartRow({ item, onQty, onRemove }) {
  const saved = item.oldPrice ? item.oldPrice - item.price : 0;

  return (
    <div className="p-5 flex flex-col sm:flex-row gap-4">
      {/* Image */}
      <div className="w-full sm:w-28">
        <div className="aspect-[4/3] rounded-xl bg-slate-100 border border-gray-300 flex items-center justify-center text-xs text-slate-400">
          Image
        </div>
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">{item.category}</div>
            <div className="font-extrabold text-slate-900">{item.name}</div>
            <div className="text-sm text-slate-600 mt-1">{item.variant}</div>
          </div>

          <button
            onClick={onRemove}
            className="text-sm font-semibold text-red-600 hover:text-red-700"
          >
            Remove
          </button>
        </div>

        {/* Variant chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs rounded-full bg-slate-100 px-3 py-1">
            Size: <span className="font-semibold">{item.size}</span>
          </span>

          <span className="text-xs rounded-full bg-slate-100 px-3 py-1 inline-flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${item.colorClass}`} />
            Color: <span className="font-semibold">{item.color}</span>
          </span>
        </div>

        {/* Price + Qty */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="font-extrabold text-lg">৳ {item.price}</div>
            {item.oldPrice ? (
              <div className="text-sm text-red-500 line-through">
                ৳ {item.oldPrice}
              </div>
            ) : null}
            {saved > 0 ? (
              <span className="text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-gray-300 px-2 py-1">
                Save ৳ {saved}
              </span>
            ) : null}
          </div>

          <QtyStepper qty={item.qty} setQty={onQty} />
        </div>
      </div>
    </div>
  );
}

function QtyStepper({ qty, setQty }) {
  return (
    <div className="inline-flex items-center rounded-xl border border-gray-300 bg-white overflow-hidden">
      <button
        onClick={() => setQty(qty - 1)}
        className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 font-bold"
        aria-label="Decrease quantity"
      >
        -
      </button>

      <input
        value={qty}
        onChange={(e) => {
          const v = parseInt(e.target.value || "1", 10);
          setQty(Number.isFinite(v) ? v : 1);
        }}
        className="w-12 h-10 text-center text-sm font-bold outline-none border border-gray-300-x"
      />

      <button
        onClick={() => setQty(qty + 1)}
        className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 font-bold"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

function Row({ label, value, hint, valueClass = "" }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-slate-600">
        {label}
        {hint ? <div className="text-xs text-slate-400">{hint}</div> : null}
      </div>
      <div className={`font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}

function MiniBadge({ icon, text }) {
  return (
    <div className="rounded-xl border border-gray-300 bg-slate-50 py-3">
      <div className="text-xl">{icon}</div>
      <div className="text-xs font-semibold mt-1">{text}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 rounded-2xl border border-gray-300 bg-white soft-card p-10 text-center">
      <div className="text-5xl">🛒</div>
      <h2 className="mt-4 text-xl font-extrabold">Your cart is empty</h2>
      <p className="mt-2 text-sm text-slate-600">
        Looks like you haven’t added anything yet.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="/"
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3"
        >
          Start Shopping
        </a>
        <a
          href="/product"
          className="rounded-xl border border-gray-300 bg-white hover:bg-slate-50 font-bold px-6 py-3"
        >
          View Products
        </a>
      </div>
    </div>
  );
}
