/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import { useCart } from "@/store/cartStore";
import { apiRequest } from "@/lib/api";
import { getToken } from "@/lib/auth";

function formatBDT(amount) {
  const n = Number(amount || 0);
  return `৳ ${n.toLocaleString("en-US")}`;
}

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.0.106:8000";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, coupon: appliedCoupon, clearCart } = useCart();

  // ✅ prevents "empty cart redirect" after successful order + clearCart()
  const orderPlacedRef = useRef(false);

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");
  const [createdOrder, setCreatedOrder] = useState(null);

  // ✅ logged in user state
  const [meLoading, setMeLoading] = useState(true);
  const [me, setMe] = useState(null);

  // Customer info form
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "Dhaka",
    area: "",
    address: "",
    note: "",
  });

  const [delivery, setDelivery] = useState("pickup");
  const [payment, setPayment] = useState("cod");
  const [paymentDetails, setPaymentDetails] = useState({
    senderNumber: "",
    transactionId: "",
  });
  const [agree, setAgree] = useState(false);

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, it) => sum + Number(it.price || 0) * Number(it.qty || 1),
      0
    );
  }, [items]);

  const shipping = useMemo(() => {
    if (delivery === "pickup") return 0;
    if (delivery === "inside_dhaka") return 80;
    return 150;
  }, [delivery]);

  const discount = useMemo(() => {
    return Number(appliedCoupon?.discount || 0);
  }, [appliedCoupon]);

  const total = useMemo(() => {
    return Math.max(subtotal + shipping - discount, 0);
  }, [subtotal, shipping, discount]);

  const isEmpty = items.length === 0;

  // ✅ redirect if cart empty (BUT NOT after order placed)
  useEffect(() => {
    if (isEmpty && !orderPlacedRef.current) router.push("/cart");
  }, [isEmpty, router]);

  // ✅ load logged-in customer from /api/customer-auth/me
  useEffect(() => {
    const run = async () => {
      setMeLoading(true);
      try {
        const token = getToken?.();
        if (!token) {
          router.push(`/login?next=/checkout`);
          return;
        }

        let data;
        try {
          data = await apiRequest("/api/customer-auth/me", { method: "GET" });
        } catch {
          const res = await fetch(`${baseUrl}/api/customer-auth/me`, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json?.message || "Failed to load profile");
          data = json;
        }

        const customer = data?.customer || data?.data || data?.user || data;
        setMe(customer);

        // ✅ prefill checkout form from profile
        setForm((p) => ({
          ...p,
          fullName: customer?.name || p.fullName,
          phone: customer?.phone || p.phone,
          email: customer?.email || p.email,
        }));
      } catch {
        router.push(`/login?next=/checkout`);
      } finally {
        setMeLoading(false);
      }
    };

    run();
  }, [router]);

  const canGoNext = useMemo(() => {
    if (step === 1) {
      return (
        form.fullName.trim() &&
        form.phone.trim() &&
        form.area.trim() &&
        form.address.trim()
      );
    }
    if (step === 2) return !!delivery;
    if (step === 3) {
      if (payment === "cod") return agree;
      return (
        paymentDetails.senderNumber.trim() &&
        paymentDetails.transactionId.trim() &&
        agree
      );
    }
    return true;
  }, [step, form, delivery, payment, paymentDetails, agree]);

  const nextStep = () => setStep((s) => Math.min(3, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  // ✅ Place order: backend uses token for customer
  const placeOrder = async () => {
    setIsLoading(true);
    setOrderError("");
    setOrderSuccess("");

    try {
      const token = getToken?.();
      if (!token) {
        router.push(`/login?next=/checkout`);
        return;
      }

    // Add this exact code right before the API call in your placeOrder function:
// In your placeOrder function, right before the API call:

console.log("======== CHECKOUT DEBUG ========");
console.log("Items from cart:", JSON.stringify(items, null, 2));

// Check each item's SKU
items.forEach((item, index) => {
  console.log(`Item ${index} SKU:`, {
    name: item.name,
    sku: item.sku,
    variantId: item.variantId,
    variant_id: item.variant_id,
    allFields: Object.keys(item)
  });
});

const orderData = {
  status: "processing",
  coupon_code: appliedCoupon?.code || null,
  tax_rate_id: null,
  shipping: shipping,
  billing_address: `${form.area}`,
  shipping_address: `${form.address}`,
  note: form.note || null,
  payment_method:payment,

  items: items.map((item) => {
    console.log(`Mapping item ${item.name}:`, {
      originalSku: item.sku,
      originalVariantId: item.variantId,
      originalVariant_id: item.variant_id,
      sending: {
        product_id: item.productId || item.product_id,
        sku: item.sku,
        variant_id: item.variantId ?? item.variant_id
      }
    });
    
    return {
      product_id: item.productId || item.product_id || null,
      product_name: item.name,
      sku: item.sku || null,
      qty: Number(item.qty || 1),
      price: Number(item.price || 0),
      variant_id: item.variantId ?? item.variant_id ?? null
    };
  }),

  payment: {
    method: payment,
    transaction_id: payment !== "cod" ? paymentDetails.transactionId : null,
    amount_paid: payment === "cod" ? 0 : total,
  },
};

console.log("Final orderData:", JSON.stringify(orderData, null, 2));
console.log("================================");

console.log("Order data being sent:", JSON.stringify(orderData, null, 2));

      let data;
      try {
        data = await apiRequest("/api/checkout", {
          method: "POST",
          body: orderData,
        });
      } catch {
        const res = await fetch(`${baseUrl}/api/checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        });

        const json = await res.json();
        if (!res.ok) {
          if (json?.errors) {
            const msgs = Object.values(json.errors).flat().join(", ");
            throw new Error(msgs || json?.message || "Failed to create order");
          }
          throw new Error(json?.message || "Failed to create order");
        }
        data = json;
      }

      // ✅ SAFELY EXTRACT ORDER + ORDER ID
      const order = data?.order || data?.data || data;
      const orderId =
        order?.id ||
        order?.order_id ||
        data?.order_id ||
        data?.id ||
        order?.order_number;

      if (!orderId) {
        throw new Error("Order created but order id not found in response.");
      }

      setOrderSuccess("Order placed successfully!");
      setCreatedOrder(order);

      // ✅ IMPORTANT: stop checkout from redirecting to /cart after clearCart()
      orderPlacedRef.current = true;

      // ✅ IMPORTANT: redirect FIRST
      router.push(`/order-confirmation/${orderId}`);

      // ✅ IMPORTANT: clear cart AFTER redirect (small delay = safest)
      setTimeout(() => {
        clearCart();
      }, 300);
    } catch (error) {
      setOrderError(error?.message || "Failed to place order. Please try again.");
      orderPlacedRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmpty) return null;

  if (meLoading) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <Container className="py-10">
          <div className="rounded-2xl border border-gray-300 bg-white p-6">
            <div className="font-extrabold text-lg">Loading checkout…</div>
            <div className="text-sm text-slate-600 mt-1">
              Checking your login session.
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <Container className="py-8">
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">Checkout</h1>
            <p className="text-sm text-slate-600 mt-1">
              Complete your order securely. Fast delivery and easy returns.
            </p>
            {me?.name ? (
              <div className="mt-2 text-xs text-slate-500">
                Logged in as <span className="font-semibold">{me.name}</span>
              </div>
            ) : null}
          </div>

          <a
            href="/cart"
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 w-fit transition-colors"
          >
            ← Back to Cart
          </a>
        </div>

        {/* Steps */}
        <div className="mt-6">
          <StepBar step={step} />
        </div>

        {/* Error/Success */}
        {orderError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {orderError}
          </div>
        )}

        {orderSuccess && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
            {orderSuccess}
          </div>
        )}

        {/* Layout */}
        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-4">
            {step === 1 && (
              <Card
                title="Customer & Shipping Information"
                subtitle="Please enter accurate details for delivery."
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Your name"
                    value={form.fullName}
                    onChange={(v) => setForm((p) => ({ ...p, fullName: v }))}
                    required
                  />
                  <Input
                    label="Phone"
                    placeholder="01XXXXXXXXX"
                    value={form.phone}
                    onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
                    required
                  />

                  <Input
                    label="Email (Optional)"
                    placeholder="you@email.com"
                    type="email"
                    value={form.email}
                    onChange={(v) => setForm((p) => ({ ...p, email: v }))}
                  />

                  <Select
                    label="City"
                    value={form.city}
                    onChange={(v) => setForm((p) => ({ ...p, city: v }))}
                    options={[
                      { value: "Dhaka", label: "Dhaka" },
                      { value: "Chattogram", label: "Chattogram" },
                      { value: "Sylhet", label: "Sylhet" },
                      { value: "Rajshahi", label: "Rajshahi" },
                      { value: "Khulna", label: "Khulna" },
                      { value: "Barishal", label: "Barishal" },
                      { value: "Rangpur", label: "Rangpur" },
                      { value: "Mymensingh", label: "Mymensingh" },
                    ]}
                  />

                  <Input
                    label="Billing Address"
                    placeholder="e.g. Mirpur, Dhanmondi"
                    value={form.area}
                    onChange={(v) => setForm((p) => ({ ...p, area: v }))}
                    required
                  />

                  <Input
                    label="Shipping Address"
                    placeholder="House, Road, Block..."
                    value={form.address}
                    onChange={(v) => setForm((p) => ({ ...p, address: v }))}
                    required
                  />
                </div>

                <div className="mt-4">
                  <Textarea
                    label="Order Note (Optional)"
                    placeholder="Any instructions for delivery..."
                    value={form.note}
                    onChange={(v) => setForm((p) => ({ ...p, note: v }))}
                  />
                </div>
              </Card>
            )}

            {step === 2 && (
              <Card
                title="Delivery Method"
                subtitle="Choose how you want to receive your order."
              >
                <div className="grid md:grid-cols-3 gap-4">
                  <RadioCard
                    active={delivery === "inside_dhaka"}
                    onClick={() => setDelivery("inside_dhaka")}
                    title="Inside Dhaka"
                    desc="Delivery within 24-48 hours"
                    price="৳ 80"
                  />
                  <RadioCard
                    active={delivery === "outside_dhaka"}
                    onClick={() => setDelivery("outside_dhaka")}
                    title="Outside Dhaka"
                    desc="Delivery within 2-5 days"
                    price="৳ 150"
                  />
                  <RadioCard
                    active={delivery === "pickup"}
                    onClick={() => setDelivery("pickup")}
                    title="Store Pickup"
                    desc="Collect from nearest store"
                    price="Free"
                  />
                </div>

                <div className="mt-4 rounded-xl border border-gray-300 bg-slate-50 p-4 text-sm text-slate-700">
                  <div className="font-semibold">Delivery Disclaimer</div>
                  <div className="mt-1 text-slate-600">
                    Delivery time may vary depending on location, traffic, and
                    product availability.
                  </div>
                </div>
              </Card>
            )}

            {step === 3 && (
              <Card
                title="Payment"
                subtitle="Select a payment method and confirm order."
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <PaymentCard
                    active={payment == "cod"}
                    onClick={() => {
                      setPayment("cod");
                      setPaymentDetails({ senderNumber: "", transactionId: "" });
                    }}
                    title="Cash on Delivery"
                    desc="Pay when you receive your order"
                    badge="Popular"
                  />
                  <PaymentCard
                    active={payment == "bkash"}
                    onClick={() => setPayment("bkash")}
                    title="bKash"
                    desc="Pay via bKash"
                    icon="💳"
                  />
                  <PaymentCard
                    active={payment == "nagad"}
                    onClick={() => setPayment("nagad")}
                    title="Nagad"
                    desc="Pay via Nagad"
                    icon="💳"
                  />
                  <PaymentCard
                    active={payment == "rocket"}
                    onClick={() => setPayment("rocket")}
                    title="Rocket"
                    desc="Pay via Rocket"
                    icon="💳"
                  />
                </div>

                {payment !== "cod" && (
                  <div className="mt-4 rounded-xl border border-gray-300 bg-white p-4">
                    <div className="text-sm font-extrabold mb-3">
                      Payment Details
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Sender Number"
                        placeholder="01XXXXXXXXX"
                        value={paymentDetails.senderNumber}
                        onChange={(v) =>
                          setPaymentDetails((p) => ({
                            ...p,
                            senderNumber: v,
                          }))
                        }
                        required
                      />
                      <Input
                        label="Transaction ID"
                        placeholder="TXN123..."
                        value={paymentDetails.transactionId}
                        onChange={(v) =>
                          setPaymentDetails((p) => ({
                            ...p,
                            transactionId: v,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="mt-3 p-3 bg-amber-50 rounded-lg text-sm">
                      <div className="font-semibold">
                        Amount to pay: {formatBDT(total)}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Send this amount to our bKash/Nagad/Rocket number:
                        01XXXXXXXXX
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-start gap-3">
                  <input
                    id="agree"
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="agree" className="text-sm text-slate-700">
                    I agree to the{" "}
                    <span className="font-semibold">Terms & Conditions</span>{" "}
                    and <span className="font-semibold">Return Policy</span>.
                  </label>
                </div>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={prevStep}
                disabled={step === 1 || isLoading}
                className={[
                  "rounded-xl px-5 py-3 font-bold transition-colors",
                  step === 1 || isLoading
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 hover:bg-slate-50",
                ].join(" ")}
              >
                ← Back
              </button>

              {step < 3 ? (
                <button
                  onClick={nextStep}
                  disabled={!canGoNext || isLoading}
                  className={[
                    "rounded-xl px-6 py-3 font-extrabold text-white transition-colors",
                    canGoNext && !isLoading
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-emerald-300 cursor-not-allowed",
                  ].join(" ")}
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={placeOrder}
                  disabled={!canGoNext || isLoading}
                  className={[
                    "rounded-xl px-6 py-3 font-extrabold text-white transition-colors flex items-center gap-2",
                    canGoNext && !isLoading
                      ? "bg-red-800 hover:bg-red-900"
                      : "bg-red-300 cursor-not-allowed",
                  ].join(" ")}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:sticky lg:top-6 h-fit space-y-4">
            <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="font-extrabold">Order Summary</div>
                <span className="text-xs rounded-full bg-slate-100 px-2 py-1">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="mt-4 space-y-3 max-h-60 overflow-y-auto pr-2">
                {items.map((i) => (
                  <div
                    key={i.lineId || `${i.id}-${i.qty}`}
                    className="flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-sm">{i.name}</div>
                      <div className="text-xs text-slate-500">
                        {i.variantLabel ? `${i.variantLabel} • ` : ""}Qty {i.qty}
                      </div>
                    </div>
                    <div className="font-bold text-sm">
                      {formatBDT(
                        Number(i.price || 0) * Number(i.qty || 1)
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {appliedCoupon && (
                <div className="mt-3 p-2 bg-emerald-50 rounded-lg">
                  <span className="text-xs font-semibold text-emerald-700">
                    Coupon {appliedCoupon.code} applied: -{formatBDT(discount)}
                  </span>
                </div>
              )}

              <div className="mt-4 border-t border-gray-300 pt-4 space-y-2 text-sm">
                <Line label="Subtotal" value={formatBDT(subtotal)} />
                <Line
                  label="Shipping"
                  value={shipping === 0 ? "Free" : formatBDT(shipping)}
                />
                {discount > 0 && (
                  <Line
                    label="Discount"
                    value={`-${formatBDT(discount)}`}
                    valueClass="text-emerald-700"
                  />
                )}
                <div className="flex items-center justify-between pt-3 border-t border-gray-300">
                  <div className="font-extrabold text-base">Total</div>
                  <div className="font-extrabold text-xl text-red-800">
                    {formatBDT(total)}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 border border-gray-300 p-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600">✓</span>
                  Secure SSL encrypted checkout
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-emerald-600">✓</span>
                  Money-back guarantee
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-sm">
              <div className="font-extrabold text-center mb-3">
                Why checkout here?
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <Mini icon="🚚" text="Fast Delivery" />
                <Mini icon="🛡️" text="Secure" />
                <Mini icon="↩️" text="Easy Return" />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-300 bg-white p-4 shadow-sm text-center">
              <div className="text-sm font-semibold">Need help?</div>
              <div className="text-xs text-slate-600 mt-1">
                Call us: 01XXXXXXXXX
                <br />
                Email: support@example.com
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

/* ---------- UI Components ---------- */

function StepBar({ step }) {
  const steps = [
    { id: 1, name: "Information" },
    { id: 2, name: "Shipping" },
    { id: 3, name: "Payment" },
  ];

  return (
    <div className="rounded-2xl border border-gray-300 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        {steps.map((s, idx) => (
          <div key={s.id} className="flex items-center gap-3 flex-1">
            <div
              className={[
                "h-9 w-9 rounded-full flex items-center justify-center font-extrabold transition-colors",
                step >= s.id
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-500",
              ].join(" ")}
            >
              {s.id}
            </div>

            <div className="min-w-0">
              <div className="text-sm font-extrabold truncate">{s.name}</div>
              <div className="text-xs text-slate-500">
                {step === s.id ? "Current" : step > s.id ? "Completed" : "Next"}
              </div>
            </div>

            {idx !== steps.length - 1 && (
              <div className="hidden md:block flex-1 h-px bg-slate-200 mx-3" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-gray-300 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-300 bg-gray-50">
        <div className="font-extrabold">{title}</div>
        {subtitle ? (
          <div className="text-sm text-slate-600 mt-1">{subtitle}</div>
        ) : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
      />
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all bg-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function RadioCard({ active, onClick, title, desc, price }) {
  return (
    <button
      onClick={onClick}
      className={[
        "text-left rounded-2xl border p-4 transition-all",
        active
          ? "border-emerald-600 ring-2 ring-emerald-200 bg-emerald-50"
          : "border-gray-300 hover:bg-slate-50",
      ].join(" ")}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-extrabold">{title}</div>
          <div className="text-sm text-slate-600 mt-1">{desc}</div>
        </div>
        <div className="text-sm font-extrabold text-emerald-700">{price}</div>
      </div>
    </button>
  );
}

function PaymentCard({ active, onClick, title, desc, badge, icon }) {
  return (
    <button
      onClick={onClick}
      className={[
        "text-left rounded-2xl border p-4 transition-all",
        active
          ? "border-emerald-600 ring-2 ring-emerald-200 bg-emerald-50"
          : "border-gray-300 hover:bg-slate-50",
      ].join(" ")}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon ? <span className="text-xl">{icon}</span> : null}
          <div>
            <div className="font-extrabold">{title}</div>
            <div className="text-sm text-slate-600 mt-1">{desc}</div>
          </div>
        </div>
        {badge ? (
          <span className="text-xs rounded-full bg-amber-100 text-amber-800 px-2 py-1 font-bold">
            {badge}
          </span>
        ) : null}
      </div>
    </button>
  );
}

function Line({ label, value, valueClass = "" }) {
  return (
    <div className="flex items-center justify-between text-slate-700">
      <div className="text-slate-600">{label}</div>
      <div className={`font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}

function Mini({ icon, text }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-slate-50 py-3">
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-xs font-semibold">{text}</div>
    </div>
  );
}