"use client";

import { useMemo, useState } from "react";
import Container from "@/components/ui/Container";

function formatBDT(amount) {
  return `৳ ${amount.toLocaleString("en-US")}`;
}

const demoCart = [
  { id: "p1", name: "Shoe Class 1", variant: "Premium Edition", qty: 1, price: 200 },
  { id: "p2", name: "Wireless Earbuds Pro", variant: "Noise Canceling", qty: 2, price: 1299 },
];

export default function CheckoutPage() {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "Dhaka",
    area: "",
    address: "",
    note: "",
  });

  const [delivery, setDelivery] = useState("inside_dhaka"); // inside_dhaka | outside_dhaka | pickup
  const [payment, setPayment] = useState("cod"); // cod | card | bkash | nagad
  const [agree, setAgree] = useState(false);

  const subtotal = useMemo(
    () => demoCart.reduce((sum, i) => sum + i.price * i.qty, 0),
    []
  );

  const shipping = useMemo(() => {
    if (delivery === "pickup") return 0;
    if (delivery === "inside_dhaka") return 80;
    return 150;
  }, [delivery]);

  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);

  const canGoNext = useMemo(() => {
    if (step === 1) {
      return (
        form.fullName.trim() &&
        form.phone.trim() &&
        (form.city || "").trim() &&
        form.area.trim() &&
        form.address.trim()
      );
    }
    if (step === 2) return !!delivery;
    if (step === 3) return !!payment && agree;
    return true;
  }, [step, form, delivery, payment, agree]);

  const nextStep = () => setStep((s) => Math.min(3, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const placeOrder = () => {
    // hook your API here
    alert("Order placed ✅ (demo)");
  };

  return (
    <div className="bg-slate-50">
      <Container className="py-8">
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">Checkout</h1>
            <p className="text-sm text-slate-600 mt-1">
              Complete your order securely. Fast delivery and easy returns.
            </p>
          </div>

          <a
            href="/cart"
            className="rounded-full border bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 w-fit"
          >
            ← Back to Cart
          </a>
        </div>

        {/* Steps */}
        <div className="mt-6">
          <StepBar step={step} />
        </div>

        {/* Layout */}
        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          {/* LEFT: Forms */}
          <div className="lg:col-span-2 space-y-4">
            {/* Step 1 */}
            {step === 1 && (
              <Card title="Customer & Shipping Information" subtitle="Please enter accurate details for delivery.">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Your name"
                    value={form.fullName}
                    onChange={(v) => setForm((p) => ({ ...p, fullName: v }))}
                  />
                  <Input
                    label="Phone"
                    placeholder="01XXXXXXXXX"
                    value={form.phone}
                    onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
                  />

                  <Input
                    label="Email (Optional)"
                    placeholder="you@email.com"
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
                    ]}
                  />

                  <Input
                    label="Area"
                    placeholder="e.g. Mirpur / Dhanmondi"
                    value={form.area}
                    onChange={(v) => setForm((p) => ({ ...p, area: v }))}
                  />

                  <Input
                    label="Address"
                    placeholder="House, Road, Block..."
                    value={form.address}
                    onChange={(v) => setForm((p) => ({ ...p, address: v }))}
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

            {/* Step 2 */}
            {step === 2 && (
              <Card title="Delivery Method" subtitle="Choose how you want to receive your order.">
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

                <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-sm text-slate-700">
                  <div className="font-semibold">Delivery disclaimer</div>
                  <div className="mt-1 text-slate-600">
                    Delivery time may vary depending on location, traffic, and product availability.
                  </div>
                </div>
              </Card>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <Card title="Payment" subtitle="Select a payment method and confirm order.">
                <div className="grid md:grid-cols-2 gap-4">
                  <PaymentCard
                    active={payment === "cod"}
                    onClick={() => setPayment("cod")}
                    title="Cash on Delivery"
                    desc="Pay when you receive your order"
                    badge="Popular"
                  />
                  <PaymentCard
                    active={payment === "card"}
                    onClick={() => setPayment("card")}
                    title="Card Payment"
                    desc="Visa / MasterCard (demo UI)"
                  />
                  <PaymentCard
                    active={payment === "bkash"}
                    onClick={() => setPayment("bkash")}
                    title="bKash"
                    desc="Pay via bKash number"
                  />
                  <PaymentCard
                    active={payment === "nagad"}
                    onClick={() => setPayment("nagad")}
                    title="Nagad"
                    desc="Pay via Nagad number"
                  />
                </div>

                {/* Optional extra fields for non-COD */}
                {payment !== "cod" && (
                  <div className="mt-4 rounded-xl border bg-white p-4">
                    <div className="text-sm font-extrabold">Payment Info (Demo)</div>
                    <div className="mt-3 grid sm:grid-cols-2 gap-4">
                      <Input label="Sender Number" placeholder="01XXXXXXXXX" value="" onChange={() => {}} />
                      <Input label="Transaction ID" placeholder="TXN123..." value="" onChange={() => {}} />
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      (You can wire this to your payment verification API later.)
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-start gap-3">
                  <input
                    id="agree"
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-1 h-4 w-4"
                  />
                  <label htmlFor="agree" className="text-sm text-slate-700">
                    I agree to the <span className="font-semibold">Terms & Conditions</span> and{" "}
                    <span className="font-semibold">Return Policy</span>.
                  </label>
                </div>
              </Card>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className={[
                  "rounded-xl px-5 py-3 font-bold",
                  step === 1
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-white border hover:bg-slate-50",
                ].join(" ")}
              >
                ← Back
              </button>

              {step < 3 ? (
                <button
                  onClick={nextStep}
                  disabled={!canGoNext}
                  className={[
                    "rounded-xl px-6 py-3 font-extrabold text-white",
                    canGoNext
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-emerald-300 cursor-not-allowed",
                  ].join(" ")}
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={placeOrder}
                  disabled={!canGoNext}
                  className={[
                    "rounded-xl px-6 py-3 font-extrabold text-white",
                    canGoNext
                      ? "bg-red-800 hover:bg-red-900"
                      : "bg-red-300 cursor-not-allowed",
                  ].join(" ")}
                >
                  Place Order
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: Summary */}
          <div className="lg:sticky lg:top-6 h-fit space-y-4">
            <div className="rounded-2xl border bg-white p-5 soft-card">
              <div className="flex items-center justify-between">
                <div className="font-extrabold">Order Summary</div>
                <span className="text-xs rounded-full bg-slate-100 px-2 py-1">
                  Secure
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {demoCart.map((i) => (
                  <div key={i.id} className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-sm">{i.name}</div>
                      <div className="text-xs text-slate-500">
                        {i.variant} • Qty {i.qty}
                      </div>
                    </div>
                    <div className="font-bold text-sm">
                      {formatBDT(i.price * i.qty)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t pt-4 space-y-2 text-sm">
                <Line label="Subtotal" value={formatBDT(subtotal)} />
                <Line
                  label="Shipping"
                  value={shipping === 0 ? "Free" : formatBDT(shipping)}
                />
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="font-extrabold text-base">Total</div>
                  <div className="font-extrabold text-xl">{formatBDT(total)}</div>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 border p-4 text-xs text-slate-600 leading-relaxed">
                Delivery cost updates based on your selected method.
              </div>
            </div>

            {/* Trust strip */}
            <div className="rounded-2xl border bg-white p-5 soft-card">
              <div className="font-extrabold">Why checkout here?</div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <Mini icon="🚚" text="Fast" />
                <Mini icon="🛡️" text="Secure" />
                <Mini icon="↩️" text="Return" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

/* ---------- UI blocks ---------- */

function StepBar({ step }) {
  const steps = [
    { id: 1, name: "Information" },
    { id: 2, name: "Shipping" },
    { id: 3, name: "Payment" },
  ];

  return (
    <div className="rounded-2xl border bg-white soft-card p-4">
      <div className="flex items-center justify-between gap-2">
        {steps.map((s, idx) => (
          <div key={s.id} className="flex items-center gap-3 flex-1">
            <div
              className={[
                "h-9 w-9 rounded-full flex items-center justify-center font-extrabold",
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
                {step === s.id ? "Current step" : step > s.id ? "Completed" : "Next"}
              </div>
            </div>

            {idx !== steps.length - 1 ? (
              <div className="hidden md:block flex-1 h-px bg-slate-200 mx-3" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border bg-white soft-card overflow-hidden">
      <div className="px-5 py-4 border-b">
        <div className="font-extrabold">{title}</div>
        {subtitle ? <div className="text-sm text-slate-600 mt-1">{subtitle}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
      />
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder }) {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="mt-2 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 bg-white"
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
        "text-left rounded-2xl border p-4 transition",
        active ? "border-emerald-600 ring-2 ring-emerald-200" : "hover:bg-slate-50",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-extrabold">{title}</div>
          <div className="text-sm text-slate-600 mt-1">{desc}</div>
        </div>
        <div className="text-sm font-extrabold">{price}</div>
      </div>
    </button>
  );
}

function PaymentCard({ active, onClick, title, desc, badge }) {
  return (
    <button
      onClick={onClick}
      className={[
        "text-left rounded-2xl border p-4 transition  border-gray-300",
        active ? "border-emerald-600 ring-2 ring-emerald-200" : "hover:bg-slate-50",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-extrabold">{title}</div>
          <div className="text-sm text-slate-600 mt-1">{desc}</div>
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

function Line({ label, value }) {
  return (
    <div className="flex items-center justify-between text-slate-700">
      <div className="text-slate-600">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function Mini({ icon, text }) {
  return (
    <div className="rounded-xl border bg-slate-50 py-3  border-gray-300">
      <div className="text-xl">{icon}</div>
      <div className="text-xs font-semibold mt-1">{text}</div>
    </div>
  );
}
