/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useMemo, useState, useEffect } from "react";
import Container from "@/components/ui/Container";
import { useCart } from "@/store/cartStore";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.0.106:8000";

function formatBDT(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "৳ —";
  return `৳ ${n.toLocaleString("en-US")}`;
}

export default function CartPage() {
  const { items, coupon: appliedCoupon, applyCoupon, removeCoupon, setQty, removeItem, clearCart } = useCart();
  
  const [couponInput, setCouponInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [productDetails, setProductDetails] = useState({});

  // Fetch product details for shipping information
  useEffect(() => {
    const fetchProductDetails = async () => {
      const uniqueProductIds = [...new Set(items.map(item => item.productId))];
      
      for (const productId of uniqueProductIds) {
        try {
          const response = await fetch(`${baseUrl}/api/products/${productId}`);
          const data = await response.json();
          
          if (data.success && data.product) {
            setProductDetails(prev => ({
              ...prev,
              [productId]: data.product
            }));
          }
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
        }
      }
    };

    if (items.length > 0) {
      fetchProductDetails();
    }
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => {
      const price = Number(it.price);
      if (!Number.isFinite(price)) return sum;
      return sum + price * (it.qty ?? 1);
    }, 0);
  }, [items]);

  // Calculate shipping dynamically from product shipping_price
  const shipping = useMemo(() => {
    if (items.length === 0) return 0;
    
    return items.reduce((sum, item) => {
      const productId = item.productId;
      const product = productDetails[productId];
      
      // Get shipping price from product data, default to 0 if not found
      const shippingPrice = product ? Number(product.shipping_price) || 0 : 0;
      
      // Multiply by quantity since shipping applies per item
      return sum + (shippingPrice * (item.qty || 1));
    }, 0);
  }, [items, productDetails]);

  const discount = useMemo(() => {
    return appliedCoupon?.discount || 0;
  }, [appliedCoupon]);

  const total = useMemo(() => {
    return Math.max(subtotal + shipping - discount, 0);
  }, [subtotal, shipping, discount]);

  const isEmpty = items.length === 0;

  // Clear messages when coupon is removed
  useEffect(() => {
    if (!appliedCoupon) {
      setCouponSuccess("");
    }
  }, [appliedCoupon]);

  const onApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    setIsApplyingCoupon(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const response = await fetch(`${baseUrl}/api/coupon/apply?code=${code}&amount=${subtotal}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      
      // Check if response starts with HTML
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        throw new Error("Received HTML instead of JSON. API endpoint might be incorrect.");
      }

      const data = JSON.parse(text);

      if (data.success) {
        applyCoupon({
          code: data.data.code,
          discount: data.data.discount,
          type: data.data.type,
          value: data.data.value
        });
        setCouponInput("");
        setCouponSuccess(data.message || "Coupon applied successfully!");
        setCouponError("");
      } else {
        setCouponError(data.message || "Invalid coupon code");
        removeCoupon();
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setCouponError(`Failed to apply coupon: ${error.message}`);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
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
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              ← Continue Shopping
            </a>

            {!isEmpty && (
              <button
                onClick={clearCart}
                className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
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
              <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                  <div className="font-extrabold">Cart Items</div>
                  <div className="text-sm text-slate-600">{items.length} item(s)</div>
                </div>

                <div className="divide-y divide-gray-200">
                  {items.map((it) => {
                    const product = productDetails[it.productId];
                    const shippingPrice = product ? Number(product.shipping_price) || 0 : 0;
                    
                    return (
                      <CartRow
                        key={it.lineId}
                        item={it}
                        shippingPrice={shippingPrice}
                        onQty={(q) => setQty(it.lineId, q)}
                        onRemove={() => removeItem(it.lineId)}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-gray-200 flex items-center justify-center">
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
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold">Coupon</div>
                  {appliedCoupon ? (
                    <button
                      onClick={() => {
                        removeCoupon();
                        setCouponSuccess("");
                      }}
                      className="text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                <p className="text-sm text-slate-600 mt-1">
                  Enter your coupon code below
                </p>

                <div className="mt-3">
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError("");
                      }}
                      placeholder="Enter coupon code"
                      className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
                      disabled={isApplyingCoupon || appliedCoupon}
                    />
                    <button
                      onClick={onApplyCoupon}
                      disabled={isApplyingCoupon || appliedCoupon || !couponInput.trim()}
                      className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-bold hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors min-w-[80px]"
                    >
                      {isApplyingCoupon ? "..." : "Apply"}
                    </button>
                  </div>
                  
                  {couponError && (
                    <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                      {couponError}
                    </div>
                  )}

                  {couponSuccess && (
                    <div className="mt-2 text-sm text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                      {couponSuccess}
                    </div>
                  )}

                  {appliedCoupon && (
                    <div className="mt-2 text-sm text-emerald-700 font-semibold">
                      ✓ {appliedCoupon.code} applied 
                      {appliedCoupon.discount > 0 && ` (Save ${formatBDT(appliedCoupon.discount)})`}
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
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
                  />
                  {discount > 0 && (
                    <Row
                      label="Discount"
                      value={`- ${formatBDT(discount)}`}
                      valueClass="text-emerald-700"
                    />
                  )}

                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="font-extrabold text-base">Total</div>
                    <div className="font-extrabold text-xl text-red-800">{formatBDT(total)}</div>
                  </div>
                </div>

                <button className="mt-4 w-full rounded-xl bg-red-800 hover:bg-red-900 text-white font-extrabold py-3 transition-colors">
                  Proceed to Checkout
                </button>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 transition-colors">
                    WhatsApp
                  </button>
                  <button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 transition-colors">
                    Messenger
                  </button>
                </div>

                <div className="mt-4 text-xs text-slate-500 leading-relaxed text-center">
                  By placing order, you agree to our Terms & Conditions and Return Policy.
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="font-extrabold text-center mb-3">Why shop with us?</div>
                <div className="grid grid-cols-3 gap-3 text-center">
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

function CartRow({ item, shippingPrice, onQty, onRemove }) {
  const price = Number(item.price);
  const oldPrice = Number(item.oldPrice);
  const hasPrice = Number.isFinite(price);
  const hasOld = Number.isFinite(oldPrice);
  const saved = hasPrice && hasOld && oldPrice > price ? oldPrice - price : 0;

  return (
    <div className="p-5 flex flex-col sm:flex-row gap-4 hover:bg-gray-50 transition-colors">
      <div className="w-full sm:w-28">
        <div className="aspect-[4/3] rounded-xl bg-slate-100 border border-gray-200 overflow-hidden flex items-center justify-center">
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-xs text-slate-400">No image</span>
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

        {item.attrs && Object.keys(item.attrs).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(item.attrs).map(([k, v]) => (
              <span key={k} className="text-xs rounded-full bg-slate-100 px-3 py-1">
                {k}: <span className="font-semibold">{String(v)}</span>
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="font-extrabold text-lg">{hasPrice ? formatBDT(price) : "৳ —"}</div>
            {hasOld && hasPrice && price < oldPrice ? (
              <div className="text-sm text-red-500 line-through">{formatBDT(oldPrice)}</div>
            ) : null}
            {saved > 0 ? (
              <span className="text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-gray-200 px-2 py-1">
                Save {formatBDT(saved)}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-4">
            {shippingPrice > 0 && (
              <span className="text-xs text-slate-500">
                Shipping: {formatBDT(shippingPrice)}/item
              </span>
            )}
            <QtyStepper qty={item.qty ?? 1} setQty={onQty} />
          </div>
        </div>
      </div>
    </div>
  );
}

function QtyStepper({ qty, setQty }) {
  return (
    <div className="inline-flex items-center rounded-xl border border-gray-300 bg-white overflow-hidden">
      <button
        onClick={() => setQty(Math.max(1, qty - 1))}
        className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 font-bold transition-colors"
        aria-label="Decrease quantity"
      >
        -
      </button>

      <input
        type="number"
        min="1"
        value={qty}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          setQty(!isNaN(v) && v > 0 ? v : 1);
        }}
        className="w-12 h-10 text-center text-sm font-bold outline-none border-x border-gray-200"
      />

      <button
        onClick={() => setQty(qty + 1)}
        className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 font-bold transition-colors"
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
        {hint && <div className="text-xs text-slate-400">{hint}</div>}
      </div>
      <div className={`font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}

function MiniBadge({ icon, text }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-slate-50 py-3">
      <div className="text-xl">{icon}</div>
      <div className="text-xs font-semibold mt-1">{text}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 rounded-2xl border border-gray-200 bg-white shadow-sm p-10 text-center">
      <div className="text-6xl mb-4">🛒</div>
      <h2 className="text-xl font-extrabold">Your cart is empty</h2>
      <p className="mt-2 text-sm text-slate-600">
        Looks like you haven't added anything yet.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="/"
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 transition-colors"
        >
          Start Shopping
        </a>
        <a
          href="/products"
          className="rounded-xl border border-gray-300 bg-white hover:bg-slate-50 font-bold px-6 py-3 transition-colors"
        >
          View Products
        </a>
      </div>
    </div>
  );
}