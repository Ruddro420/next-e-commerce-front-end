/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useMemo, useState } from "react";
import Container from "@/components/ui/Container";
import { useCart } from "@/store/cartStore";

function formatBDT(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "৳ —";
  return `৳ ${n.toLocaleString("en-US")}`;
}

// demo coupon rules (you can replace with API validation later)
function computeDiscount({ coupon, subtotal, shipping }) {
  if (!coupon) return 0;
  if (coupon === "SAVE10") return Math.round(subtotal * 0.1);
  if (coupon === "FREESHIP") return shipping;
  return 0;
}

export default function CartPage() {
  const { items, coupon: appliedCoupon, applyCoupon, removeCoupon, setQty, removeItem, clearCart } = useCart();

  const [couponInput, setCouponInput] = useState("");

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => {
      const price = Number(it.price);
      if (!Number.isFinite(price)) return sum;
      return sum + price * (it.qty ?? 1);
    }, 0);
  }, [items]);

  const shipping = useMemo(() => {
    if (items.length === 0) return 0;
    return subtotal >= 3000 ? 0 : 120;
  }, [items.length, subtotal]);

  const discount = useMemo(() => {
    return computeDiscount({ coupon: appliedCoupon, subtotal, shipping });
  }, [appliedCoupon, subtotal, shipping]);

  const total = useMemo(() => {
    return Math.max(subtotal + shipping - discount, 0);
  }, [subtotal, shipping, discount]);

  const isEmpty = items.length === 0;

  const onApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    // demo validation
    if (code === "SAVE10" || code === "FREESHIP") {
      applyCoupon(code);
    } else {
      // you can show toast instead
      alert("Invalid coupon");
      removeCoupon();
    }
  };

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
                className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>

        {isEmpty ? (
          <EmptyState />
        ) : (
          <div className="mt-6 grid lg:grid-cols-3 gap-6">
            {/* Left: Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl bg-white border border-gray-300 soft-card overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-300 flex items-center justify-between">
                  <div className="font-extrabold">Cart Items</div>
                  <div className="text-sm text-slate-600">{items.length} item(s)</div>
                </div>

                <div className="divide-y">
                  {items.map((it) => (
                    <CartRow
                      key={it.lineId}
                      item={it}
                      onQty={(q) => setQty(it.lineId, q)}
                      onRemove={() => removeItem(it.lineId)}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-300 bg-white p-5 soft-card">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-gray-300 flex items-center justify-center">
                    🚚
                  </div>
                  <div>
                    <div className="font-extrabold">Delivery & Return</div>
                    <p className="text-sm text-slate-600 mt-1">
                      Fast delivery inside Dhaka. Easy return within 3 days if the product is unused and packaging is intact.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Summary */}
            <div className="lg:sticky lg:top-6 h-fit space-y-4">
              {/* Coupon */}
              <div className="rounded-2xl border border-gray-300 bg-white p-5 soft-card">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold">Coupon</div>
                  {appliedCoupon ? (
                    <button
                      onClick={removeCoupon}
                      className="text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                <p className="text-sm text-slate-600 mt-1">
                  Try <span className="font-semibold">SAVE10</span> or{" "}
                  <span className="font-semibold">FREESHIP</span>.
                </p>

                <div className="mt-3 flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                  <button
                    onClick={onApplyCoupon}
                    className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-bold hover:bg-emerald-700"
                  >
                    Apply
                  </button>
                </div>

                {appliedCoupon ? (
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

                  <div className="pt-3 border-t border-gray-300 flex items-center justify-between">
                    <div className="font-extrabold text-base">Total</div>
                    <div className="font-extrabold text-xl">{formatBDT(total)}</div>
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
                  By placing order, you agree to our Terms & Conditions and Return Policy.
                </div>
              </div>

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
  const price = Number(item.price);
  const oldPrice = Number(item.oldPrice);
  const hasPrice = Number.isFinite(price);
  const hasOld = Number.isFinite(oldPrice);
  const saved = hasPrice && hasOld && oldPrice > price ? oldPrice - price : 0;

  return (
    <div className="p-5 flex flex-col sm:flex-row gap-4 border-b border-gray-300">
      <div className="w-full sm:w-28">
        <div className="aspect-[4/3] rounded-xl bg-slate-100 border border-gray-300 overflow-hidden flex items-center justify-center text-xs text-slate-400">
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
          ) : (
            "Image"
          )}
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">{item.category || "Product"}</div>
            <div className="font-extrabold text-slate-900">{item.name}</div>
            {item.variantLabel ? (
              <div className="text-sm text-slate-600 mt-1">{item.variantLabel}</div>
            ) : null}
          </div>

          <button
            onClick={onRemove}
            className="text-sm font-semibold text-red-600 hover:text-red-700"
          >
            Remove
          </button>
        </div>

        {item.attrs ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(item.attrs).map(([k, v]) => (
              <span key={k} className="text-xs rounded-full bg-slate-100 px-3 py-1">
                {k}: <span className="font-semibold">{String(v)}</span>
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="font-extrabold text-lg">{hasPrice ? formatBDT(price) : "৳ —"}</div>
            {hasOld && hasPrice && price < oldPrice ? (
              <div className="text-sm text-red-500 line-through">{formatBDT(oldPrice)}</div>
            ) : null}
            {saved > 0 ? (
              <span className="text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-gray-300 px-2 py-1">
                Save {formatBDT(saved)}
              </span>
            ) : null}
          </div>

          <QtyStepper qty={item.qty ?? 1} setQty={onQty} />
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
        className="w-12 h-10 text-center text-sm font-bold outline-none border border-gray-100"
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