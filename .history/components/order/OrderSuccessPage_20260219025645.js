"use client";

import Container from "@/components/ui/Container";

function formatBDT(n) {
  return `৳ ${n.toLocaleString("en-US")}`;
}

export default function OrderSuccessPage() {
  // Demo order data (replace from query/DB)
  const order = {
    id: "SB-10521",
    date: "19 Feb 2026",
    payment: "Cash on Delivery",
    shipping: "Inside Dhaka",
    customer: { name: "Ruddro Ali", phone: "01XXXXXXXXX", address: "House 12, Road 6, Dhanmondi, Dhaka" },
    items: [
      { name: "Shoe Class 1", variant: "Premium Edition", qty: 1, price: 200 },
      { name: "Wireless Earbuds Pro", variant: "Noise Canceling", qty: 2, price: 1299 },
    ],
  };

  const subtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingFee = order.shipping === "Inside Dhaka" ? 80 : 150;
  const total = subtotal + shippingFee;

  return (
    <div className="bg-slate-50 min-h-screen">
      <Container className="py-10">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-4">
            <div className="border border-gray-300 bg-white rounded-2xl p-6 soft-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1 text-sm font-bold">
                    ✅ Order Confirmed
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold mt-3">
                    Thank you! Your order has been placed.
                  </h1>
                  <p className="text-sm text-slate-600 mt-2">
                    We’ve received your order and will process it soon. You can track it from your account.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Order ID</div>
                  <div className="font-extrabold text-lg">{order.id}</div>
                  <div className="text-xs text-slate-500 mt-1">{order.date}</div>
                </div>
              </div>

              <div className="mt-5 grid md:grid-cols-2 gap-4">
                <InfoBox title="Delivery Address" value={`${order.customer.name}\n${order.customer.phone}\n${order.customer.address}`} />
                <InfoBox title="Payment & Shipping" value={`Payment: ${order.payment}\nShipping: ${order.shipping}`} />
              </div>

              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <a
                  href="/account"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 text-center"
                >
                  Go to My Account
                </a>
                <a
                  href="/shop"
                  className="rounded-xl border border-gray-300 bg-white hover:bg-slate-50 font-bold px-6 py-3 text-center"
                >
                  Continue Shopping
                </a>
              </div>
            </div>

            {/* Items */}
            <div className="border border-gray-300 bg-white rounded-2xl soft-card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-300">
                <div className="font-extrabold">Order Items</div>
                <div className="text-sm text-slate-600 mt-1">{order.items.length} item(s)</div>
              </div>

              <div className="divide-y border-t border-gray-300">
                {order.items.map((it, idx) => (
                  <div key={idx} className="p-6 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-20 rounded-xl bg-slate-100 border border-gray-300 flex items-center justify-center text-xs text-slate-500">
                        Image
                      </div>
                      <div>
                        <div className="font-extrabold">{it.name}</div>
                        <div className="text-sm text-slate-600 mt-1">{it.variant}</div>
                        <div className="text-sm text-slate-600">Qty: {it.qty}</div>
                      </div>
                    </div>
                    <div className="font-extrabold">{formatBDT(it.price * it.qty)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="border border-gray-300 bg-white rounded-2xl p-6 soft-card">
              <div className="font-extrabold text-lg">Summary</div>

              <div className="mt-4 space-y-2 text-sm">
                <Line label="Subtotal" value={formatBDT(subtotal)} />
                <Line label="Shipping" value={formatBDT(shippingFee)} />
                <div className="pt-3 border-t border-gray-300 flex items-center justify-between">
                  <div className="font-extrabold text-base">Total</div>
                  <div className="font-extrabold text-xl">{formatBDT(total)}</div>
                </div>
              </div>

              <div className="mt-4 border border-gray-300 rounded-xl p-4 bg-slate-50 text-xs text-slate-600 leading-relaxed">
                Need help? Call <span className="font-bold">16793</span> (9AM–8PM)
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3">
                  WhatsApp
                </button>
                <button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3">
                  Messenger
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

function InfoBox({ title, value }) {
  return (
    <div className="border border-gray-300 rounded-xl p-4 bg-white">
      <div className="text-sm font-extrabold">{title}</div>
      <pre className="mt-2 text-sm text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
        {value}
      </pre>
    </div>
  );
}

function Line({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-slate-600">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
