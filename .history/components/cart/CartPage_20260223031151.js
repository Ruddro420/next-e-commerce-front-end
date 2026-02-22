/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useMemo, useState, useEffect } from "react";
import Container from "@/components/ui/Container";
import { useCart } from "@/store/cartStore";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.0.106:8000";

function formatBDT(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "৳ —";
  return `৳ ${n.toLocaleString("en-US")}`;
}

// Skeleton Loader Components
function CartSkeleton() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <Container className="py-8">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded-lg mt-2 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="divide-y divide-gray-200">
                {[1, 2].map((i) => (
                  <div key={i} className="p-5 flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-28">
                      <div className="aspect-[4/3] rounded-xl bg-gray-200 animate-pulse"></div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between">
                        <div>
                          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-5 w-40 bg-gray-200 rounded mt-2 animate-pulse"></div>
                        </div>
                        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-8 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gray-200 animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 rounded mt-2 animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded mt-1 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-40 bg-gray-200 rounded mt-2 animate-pulse"></div>
              <div className="mt-3 flex gap-2">
                <div className="flex-1 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-10 w-20 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex justify-between">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <div className="mt-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 h-12 w-full bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mx-auto"></div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
                    <div className="h-3 w-12 bg-gray-200 rounded mt-2 mx-auto animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

// Shipping Calculator Component
function ShippingCalculator({ items, onShippingCalculated }) {
  const [productDetails, setProductDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true);
      const uniqueProductIds = [...new Set(items.map(item => item.productId))];
      const details = {};
      
      for (const productId of uniqueProductIds) {
        try {
          const response = await fetch(`${baseUrl}/api/products/${productId}`);
          const data = await response.json();
          
          if (data.success && data.product) {
            details[productId] = data.product;
          }
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
        }
      }
      
      setProductDetails(details);
      setIsLoading(false);
    };

    if (items.length > 0) {
      fetchProductDetails();
    } else {
      setIsLoading(false);
    }
  }, [items]);

  const shipping = useMemo(() => {
    if (items.length === 0) return 0;
    
    return items.reduce((sum, item) => {
      const productId = item.productId;
      const product = productDetails[productId];
      const shippingPrice = product ? Number(product.shipping_price) || 0 : 0;
      return sum + (shippingPrice * (item.qty || 1));
    }, 0);
  }, [items, productDetails]);

  // Pass shipping to parent component
  useEffect(() => {
    if (onShippingCalculated) {
      onShippingCalculated(shipping, isLoading);
    }
  }, [shipping, isLoading, onShippingCalculated]);

  return null; // This is a logic-only component
}

export default function CartPage() {
  const { items, coupon: appliedCoupon, applyCoupon, removeCoupon, setQty, removeItem, clearCart } = useCart();
  
  const [couponInput, setCouponInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [shipping, setShipping] = useState(0);
  const [isShippingLoading, setIsShippingLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Simulate initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => {
      const price = Number(it.price);
      if (!Number.isFinite(price)) return sum;
      return sum + price * (it.qty ?? 1);
    }, 0);
  }, [items]);

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

  const handleShippingCalculated = (calculatedShipping, isLoading) => {
    setShipping(calculatedShipping);
    setIsShippingLoading(isLoading);
  };

  // Show skeleton loader while page is loading
  if (isPageLoading) {
    return <CartSkeleton />;
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <ShippingCalculator 
        items={items} 
        onShippingCalculated={handleShippingCalculated}
      />
      
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
                  {items.map((it) => (
                    <CartRow
                      key={it.lineId}
                      item={it}
                      isLoading={isShippingLoading}
                      onQty={(q) => setQty(it.lineId, q)}
                      onRemove={() => removeItem(it.lineId)}
                    />
                  ))}
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
                      {isApplyingCoupon ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : "Apply"}
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
                    value={isShippingLoading ? (
                      <div className="flex items-center">
                        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ) : shipping === 0 ? "Free" : formatBDT(shipping)}
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
                    <div className="font-extrabold text-xl text-red-800">
                      {isShippingLoading ? (
                        <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
                      ) : formatBDT(total)}
                    </div>
                  </div>
                </div>

                {/* Checkout Button - Updated Link */}
                <Link 
                  href="/checkout"
                  className="mt-4 w-full rounded-xl bg-red-800 hover:bg-red-900 text-white font-extrabold py-3 transition-colors flex items-center justify-center"
                >
                  Proceed to Checkout
                </Link>

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

function CartRow({ item, isLoading, onQty, onRemove }) {
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
            {isLoading ? (
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <span className="text-xs text-slate-500">
                Shipping calculated at checkout
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
      <div className="text-6xl mb-4"><ShoppingBag/></div>
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