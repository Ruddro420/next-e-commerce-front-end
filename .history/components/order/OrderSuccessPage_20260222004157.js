"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Container from "@/components/ui/Container";
import Link from "next/link";

function formatBDT(n) {
  return `৳ ${n.toLocaleString("en-US")}`;
}

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    fetchOrderDetails();
  }, [orderId, router]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.0.106:8000";
      const response = await fetch(`${baseUrl}/api/orders/${orderId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch order details");
      }

      setOrder(data.order || data.data || data);
    } catch (error) {
      console.error("Error fetching order:", error);
      setError(error.message || "Could not load order details");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals
  const subtotal = order?.items?.reduce((s, i) => s + (Number(i.price) * Number(i.qty)), 0) || 0;
  const shippingFee = Number(order?.shipping) || 0;
  const discount = Number(order?.discount) || 0;
  const total = subtotal + shippingFee - discount;

  // Format date
  const orderDate = order?.created_at ? new Date(order.created_at).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : '';

  if (isLoading) {
    return <OrderSuccessSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <Container className="py-10">
          <div className="border border-gray-300 bg-white rounded-2xl p-10 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-xl font-extrabold">Order Not Found</h2>
            <p className="mt-2 text-sm text-slate-600">{error || "We couldn't find your order details."}</p>
            <div className="mt-6">
              <Link
                href="/"
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 inline-block"
              >
                Go to Homepage
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <Container className="py-10">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Success Header */}
            <div className="border border-gray-300 bg-white rounded-2xl p-6 soft-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                    <span>✅</span> Order Confirmed
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold mt-3">
                    Thank you, {order.customer?.name || order.customer_name || 'Valued Customer'}!
                  </h1>
                  <p className="text-sm text-slate-600 mt-2">
                    We've received your order and will process it soon. You'll receive a confirmation email shortly.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Order ID</div>
                  <div className="font-extrabold text-lg">#{order.id || order.order_id}</div>
                  <div className="text-xs text-slate-500 mt-1">{orderDate}</div>
                </div>
              </div>

              {/* Customer Info Grid */}
              <div className="mt-5 grid md:grid-cols-2 gap-4">
                <InfoBox 
                  title="Delivery Address" 
                  value={`${order.customer?.name || order.customer_name || 'N/A'}\n${order.customer?.phone || order.customer_phone || 'N/A'}\n${order.shipping_address || order.billing_address || 'N/A'}`}
                />
                <InfoBox 
                  title="Payment & Shipping" 
                  value={`Payment: ${order.payment_method || order.payment?.method || 'Cash on Delivery'}\nShipping: ${order.shipping_method || 'Standard Delivery'}\nStatus: ${order.payment_status || order.status || 'Processing'}`}
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/account"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 text-center transition-colors"
                >
                  Track Order
                </Link>
                <Link
                  href="/shop"
                  className="rounded-xl border border-gray-300 bg-white hover:bg-slate-50 font-bold px-6 py-3 text-center transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Items */}
            <div className="border border-gray-300 bg-white rounded-2xl soft-card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-300 bg-gray-50">
                <div className="font-extrabold">Order Items</div>
                <div className="text-sm text-slate-600 mt-1">{order.items?.length || 0} item(s)</div>
              </div>

              <div className="divide-y divide-gray-200">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="p-6 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-20 rounded-xl bg-slate-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.product_name || item.name} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-xs text-slate-500">Image</span>
                        )}
                      </div>
                      <div>
                        <div className="font-extrabold">{item.product_name || item.name}</div>
                        {item.variant && <div className="text-sm text-slate-600 mt-1">{item.variant}</div>}
                        <div className="text-sm text-slate-600">Qty: {item.qty}</div>
                      </div>
                    </div>
                    <div className="font-extrabold">{formatBDT(Number(item.price) * Number(item.qty))}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="border border-gray-300 bg-white rounded-2xl p-6 soft-card">
              <h3 className="font-extrabold mb-4">Order Timeline</h3>
              <div className="space-y-3">
                <TimelineItem 
                  status="Order Placed" 
                  time={orderDate}
                  completed={true}
                  isLast={false}
                />
                <TimelineItem 
                  status="Payment Confirmed" 
                  time={order.payment_status === 'paid' ? orderDate : 'Pending'}
                  completed={order.payment_status === 'paid'}
                  isLast={false}
                />
                <TimelineItem 
                  status="Order Processing" 
                  time=""
                  completed={order.status === 'processing'}
                  isLast={false}
                />
                <TimelineItem 
                  status="Shipped" 
                  time=""
                  completed={order.status === 'shipped'}
                  isLast={false}
                />
                <TimelineItem 
                  status="Delivered" 
                  time=""
                  completed={order.status === 'delivered'}
                  isLast={true}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Support */}
          <div className="lg:sticky lg:top-6 h-fit space-y-4">
            {/* Order Summary */}
            <div className="border border-gray-300 bg-white rounded-2xl p-6 soft-card">
              <div className="font-extrabold text-lg">Order Summary</div>

              <div className="mt-4 space-y-2 text-sm">
                <Line label="Subtotal" value={formatBDT(subtotal)} />
                <Line label="Shipping" value={formatBDT(shippingFee)} />
                {discount > 0 && (
                  <Line label="Discount" value={`-${formatBDT(discount)}`} valueClass="text-emerald-700" />
                )}
                <div className="pt-3 border-t border-gray-300 flex items-center justify-between">
                  <div className="font-extrabold text-base">Total Paid</div>
                  <div className="font-extrabold text-xl text-red-800">{formatBDT(total)}</div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="mt-4 border border-gray-300 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Payment Status</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                    order.payment_status === 'partial' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {order.payment_status || 'Pending'}
                  </span>
                </div>
                {order.payment?.method && (
                  <div className="text-xs text-slate-600 mt-2">
                    Payment Method: {order.payment.method}
                  </div>
                )}
              </div>
            </div>

            {/* Support Info */}
            <div className="border border-gray-300 bg-white rounded-2xl p-6 soft-card">
              <div className="font-extrabold mb-3">Need Help?</div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className="text-xl">📞</span>
                  <div>
                    <div className="font-semibold">Customer Support</div>
                    <div className="text-xs text-slate-600">Call 16793 (9AM–8PM)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className="text-xl">✉️</span>
                  <div>
                    <div className="font-semibold">Email Us</div>
                    <div className="text-xs text-slate-600">support@example.com</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 transition-colors">
                  WhatsApp
                </button>
                <button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 transition-colors">
                  Messenger
                </button>
              </div>
            </div>

            {/* Share Order */}
            <div className="border border-gray-300 bg-white rounded-2xl p-6 soft-card text-center">
              <div className="font-extrabold mb-2">Share Your Order</div>
              <p className="text-xs text-slate-600 mb-3">Let your friends know what you bought!</p>
              <div className="flex justify-center gap-2">
                <button className="w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700">f</button>
                <button className="w-10 h-10 rounded-full bg-sky-500 text-white hover:bg-sky-600">𝕏</button>
                <button className="w-10 h-10 rounded-full bg-green-600 text-white hover:bg-green-700">📱</button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

// Skeleton Loader for Order Success
function OrderSuccessSkeleton() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <Container className="py-10">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Header Skeleton */}
            <div className="border border-gray-300 bg-white rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="h-6 w-32 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-8 w-64 bg-gray-200 rounded-lg mt-4 animate-pulse"></div>
                  <div className="h-4 w-96 bg-gray-200 rounded mt-3 animate-pulse"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded mt-2 animate-pulse"></div>
                </div>
              </div>
              <div className="mt-5 grid md:grid-cols-2 gap-4">
                <div className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>

            {/* Items Skeleton */}
            <div className="border border-gray-300 bg-white rounded-2xl p-6">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-4 mt-4">
                {[1, 2].map(i => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="h-16 w-20 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded mt-2 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="space-y-4">
            <div className="border border-gray-300 bg-white rounded-2xl p-6">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-3 mt-4">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

// Timeline Item Component
function TimelineItem({ status, time, completed, isLast }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
          completed ? 'bg-emerald-600' : 'bg-gray-300'
        }`}>
          {completed && <span className="text-white text-xs">✓</span>}
        </div>
        {!isLast && <div className="w-0.5 h-8 bg-gray-300 mt-1"></div>}
      </div>
      <div className="flex-1 pb-3">
        <div className="font-semibold text-sm">{status}</div>
        {time && <div className="text-xs text-slate-500">{time}</div>}
      </div>
    </div>
  );
}

// Info Box Component
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

// Line Component
function Line({ label, value, valueClass = "" }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-slate-600">{label}</div>
      <div className={`font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}