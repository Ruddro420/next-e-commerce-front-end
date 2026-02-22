/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import { useAuth } from "@/providers/AuthProvider";
import { authFetch } from "@/lib/api";

const NAV = [
  { key: "profile", label: "Profile", icon: "👤" },
  { key: "orders", label: "Orders", icon: "📦" },
  // { key: "addresses", label: "Addresses", icon: "🏠" },
  // { key: "security", label: "Security", icon: "🔒" },
  // { key: "wishlist", label: "Wishlist", icon: "❤" },
  { key: "logout", label: "Logout", icon: "🚪" },
];

function formatBDT(amount) {
  const n = Number(amount);
  return `৳ ${isNaN(n) ? 0 : n.toLocaleString("en-US")}`;
}

function formatDate(dt) {
  if (!dt) return "-";
  const d = new Date(dt);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AccountPage() {
  const router = useRouter();
  const { customer, loading: authLoading, setCustomer, logout } = useAuth();

  const [active, setActive] = useState("profile");

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  // Addresses (simple: use fields from customer table; you can expand later)
  const addresses = useMemo(() => {
    if (!customer) return [];
    const a = [];

    if (customer.shipping_address) {
      a.push({
        id: "shipping",
        label: "Shipping",
        name: customer.name,
        phone: customer.phone || "-",
        address: customer.shipping_address,
        isDefault: true,
      });
    }

    if (customer.billing_address) {
      a.push({
        id: "billing",
        label: "Billing",
        name: customer.name,
        phone: customer.phone || "-",
        address: customer.billing_address,
        isDefault: !customer.shipping_address,
      });
    }

    // if (!a.length) {
    //   a.push({
    //     id: "none",
    //     label: "No address saved",
    //     name: customer.name,
    //     phone: customer.phone || "-",
    //     address: "Add an address from Profile to speed up checkout.",
    //     isDefault: true,
    //   });
    // }

    return a;
  }, [customer]);

  // Profile saving state
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");

  const title = useMemo(() => {
    const found = NAV.find((n) => n.key === active);
    return found ? found.label : "Account";
  }, [active]);

  // Must login
  useEffect(() => {
    if (authLoading) return;
    if (!customer) router.replace("/login?next=/account");
  }, [customer, authLoading, router]);

  // Load orders only when Orders tab is opened - FIXED VERSION
  useEffect(() => {
    if (!customer) return;
    if (active !== "orders") return;

    let alive = true;
    setOrdersLoading(true);
    setOrdersError("");

    const fetchOrders = async () => {
      try {
        console.log("Fetching orders for customer:", customer.id);
        const data = await authFetch("/api/customer-auth/customer/orders");
        console.log("Orders API response:", data); // Debug log
        
        if (!alive) return;

        // Handle the response structure correctly
        if (data && data.success && data.orders) {
          // Your backend returns paginated data with 'data' property
          const ordersList = data.orders.data || [];
          console.log("Orders list:", ordersList); // Debug log
          setOrders(ordersList);
        } else if (Array.isArray(data)) {
          // Fallback if API returns direct array
          setOrders(data);
        } else if (data && data.orders && Array.isArray(data.orders)) {
          // Another possible structure
          setOrders(data.orders);
        } else {
          console.warn("Unexpected response structure:", data);
          setOrders([]);
          setOrdersError("No orders found or invalid response format");
        }
      } catch (e) {
        if (!alive) return;
        console.error("Orders fetch error:", e);
        setOrdersError(e.message || "Failed to load orders");
      } finally {
        if (alive) setOrdersLoading(false);
      }
    };

    fetchOrders();

    return () => {
      alive = false;
    };
  }, [active, customer]);

  const handleSaveProfile = async (draft) => {
    setSaving(true);
    setSaveMsg("");
    setSaveErr("");

    try {
      const res = await authFetch("/api/customer/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: draft.name,
          phone: draft.phone || null,
          email: draft.email || null,
          billing_address: draft.billing_address || null,
          shipping_address: draft.shipping_address || null,
        }),
      });

      setCustomer(res.customer);
      setSaveMsg("Profile updated successfully.");
    } catch (e) {
      setSaveErr(e.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  if (authLoading || !customer) {
    return (
      <div className="bg-slate-50">
        <Container className="py-10">
          <div className="rounded-2xl border border-gray-300 bg-white p-6">Loading...</div>
        </Container>
      </div>
    );
  }

  const joined = customer.created_at ? formatDate(customer.created_at) : "-";

  return (
    <div className="bg-slate-50">
      <Container className="py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">My Account</h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage profile, orders, addresses and security settings.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-300 bg-white soft-card px-4 py-3 flex items-center gap-3 w-fit">
            <Avatar name={customer.name} />
            <div className="leading-tight">
              <div className="font-extrabold">{customer.name}</div>
              <div className="text-xs text-slate-500">Joined {joined}</div>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="mt-6 grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Desktop sidebar */}
            <div className="hidden lg:block rounded-2xl border border-gray-300 bg-white soft-card overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-300">
                <div className="font-extrabold">Settings</div>
                <div className="text-xs text-slate-500 mt-1">Quick navigation</div>
              </div>

              <div className="p-2">
                {NAV.map((n) => (
                  <button
                    key={n.key}
                    onClick={() => setActive(n.key)}
                    className={[
                      "w-full text-left rounded-xl px-4 py-3 flex items-center gap-3 transition",
                      active === n.key ? "bg-emerald-50 border border-emerald-100" : "hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <span className="text-lg">{n.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold">{n.label}</div>
                      <div className="text-xs text-slate-500">{navHint(n.key)}</div>
                    </div>
                    <span className="text-slate-400">›</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile tabs */}
            <div className="lg:hidden rounded-2xl border border-gray-300 bg-white soft-card p-2 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {NAV.map((n) => (
                  <button
                    key={n.key}
                    onClick={() => setActive(n.key)}
                    className={[
                      "rounded-full px-4 py-2 text-sm font-semibold border border-gray-300 transition whitespace-nowrap",
                      active === n.key
                        ? "bg-emerald-600 text-white border-emerald-600 "
                        : "bg-white hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {n.icon} {n.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <section className="lg:col-span-3 space-y-4">
            <div className="rounded-2xl border border-gray-300 bg-white soft-card overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-300 flex items-center justify-between">
                <div>
                  <div className="font-extrabold">{title}</div>
                  <div className="text-sm text-slate-600 mt-1">{sectionSubtitle(active)}</div>
                </div>

                {active === "orders" ? (
                  <button
                    onClick={() => {
                      // Force refresh orders
                      setActive("profile");
                      setTimeout(() => setActive("orders"), 10);
                    }}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-sm"
                  >
                    Refresh
                  </button>
                ) : null}
              </div>

              <div className="p-5">
                {active === "profile" && (
                  <ProfileSection
                    customer={customer}
                    joined={joined}
                    onSave={handleSaveProfile}
                    saving={saving}
                    saveMsg={saveMsg}
                    saveErr={saveErr}
                  />
                )}

                {active === "orders" && (
                  <OrdersSection orders={orders} loading={ordersLoading} error={ordersError} />
                )}

                {active === "addresses" && <AddressesSection addresses={addresses} />}

                {active === "security" && <SecuritySection />}

                {active === "wishlist" && <WishlistSection />}

                {active === "logout" && <LogoutSection onLogout={handleLogout} />}
              </div>
            </div>

            {/* Trust strip / Support */}
            <div className="grid md:grid-cols-3 gap-4">
              <MiniInfo icon="📞" title="Support" text="Call 16793 (9AM-8PM)" />
              <MiniInfo icon="🚚" title="Fast Delivery" text="Inside Dhaka 24-48 hours" />
              <MiniInfo icon="↩️" title="Easy Return" text="Return within 3 days" />
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}

/* -------------------- Sections -------------------- */

function ProfileSection({ customer, joined, onSave, saving, saveMsg, saveErr }) {
  const [draft, setDraft] = useState({
    name: customer.name || "",
    phone: customer.phone || "",
    email: customer.email || "",
    billing_address: customer.billing_address || "",
    shipping_address: customer.shipping_address || "",
  });

  useEffect(() => {
    setDraft({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      billing_address: customer.billing_address || "",
      shipping_address: customer.shipping_address || "",
    });
  }, [customer]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Profile card */}
      <div className="lg:col-span-1 rounded-2xl border border-gray-300 bg-slate-50 p-5">
        <div className="flex items-center gap-3">
          <Avatar name={draft.name} size="lg" />
          <div>
            <div className="font-extrabold">{draft.name || "Customer"}</div>
            <div className="text-sm text-slate-600">{draft.phone || "-"}</div>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <InfoLine label="Phone" value={draft.phone || "-"} />
          <InfoLine label="Email" value={draft.email || "-"} />
          <InfoLine label="Joined" value={joined} />
        </div>

        {/* <div className="mt-4 text-xs text-slate-500">
          Tip: Save shipping address to checkout faster.
        </div> */}
      </div>

      {/* Form */}
      <div className="lg:col-span-2">
        {saveMsg ? (
          <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {saveMsg}
          </div>
        ) : null}
        {saveErr ? (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {saveErr}
          </div>
        ) : null}

        <div className="grid sm:grid-cols-2 gap-4">
          <Input  label="Full Name" value={draft.name} onChange={(v) => setDraft((p) => ({ ...p, name: v }))} />
          <Input  label="Phone" value={draft.phone} onChange={(v) => setDraft((p) => ({ ...p, phone: v }))} />
          <Input  label="Email" value={draft.email} onChange={(v) => setDraft((p) => ({ ...p, email: v }))} />
        </div>

        {/* <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <Textarea
            label="Shipping Address"
            value={draft.shipping_address}
            onChange={(v) => setDraft((p) => ({ ...p, shipping_address: v }))}
            placeholder="House, Road, Area, City..."
          />
          <Textarea
            label="Billing Address"
            value={draft.billing_address}
            onChange={(v) => setDraft((p) => ({ ...p, billing_address: v }))}
            placeholder="House, Road, Area, City..."
          />
        </div> */}

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          {/* <button
            onClick={() => onSave(draft)}
            disabled={saving}
            className={[
              "rounded-xl text-white font-extrabold px-6 py-3",
              saving ? "bg-emerald-300 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700",
            ].join(" ")}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button> */}
        </div>
      </div>
    </div>
  );
}

function OrdersSection({ orders, loading, error }) {
  if (loading) return <div className="text-sm text-slate-600">Loading orders...</div>;
  if (error) return <div className="text-sm text-red-700">{error}</div>;
  if (!orders.length) return <div className="text-sm text-slate-600">No orders yet.</div>;

  return (
    <div className="space-y-4">
      <div className="hidden md:block rounded-2xl border border-gray-300 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-gray-300">
            <tr className="text-left">
              <th className="px-4 py-3 font-extrabold">Order</th>
              <th className="px-4 py-3 font-extrabold">Date</th>
              <th className="px-4 py-3 font-extrabold">Total</th>
              <th className="px-4 py-3 font-extrabold">Status</th>
              <th className="px-4 py-3 font-extrabold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{o.order_number || `ORD-${o.id}`}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(o.created_at)}</td>
                <td className="px-4 py-3 font-bold">{formatBDT(o.total || 0)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status || "Processing"} />
                </td>
                <td className="px-4 py-3 text-right">
                  <a className="text-emerald-700 font-semibold hover:underline" href={`/order-confirmation/${o.id}`}>
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-2xl border border-gray-300 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-extrabold">{o.order_number || `ORD-${o.id}`}</div>
                <div className="text-xs text-slate-500">{formatDate(o.created_at)}</div>
              </div>
              <StatusBadge status={o.status || "Processing"} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="text-slate-600">Total</div>
              <div className="font-extrabold text-right">{formatBDT(o.total || 0)}</div>
            </div>

            <a
              href={`/order-confirmation/${o.id}`}
              className="mt-3 block w-full rounded-xl border border-gray-300 bg-white hover:bg-slate-50 font-bold py-2.5 text-center"
            >
              View Order
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddressesSection({ addresses }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {addresses.map((a) => (
        <div key={a.id} className="rounded-2xl border border-gray-300 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-extrabold flex items-center gap-2">
                {a.label}
                {a.isDefault ? (
                  <span className="text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 font-bold">
                    Default
                  </span>
                ) : null}
              </div>
              <div className="text-sm text-slate-600 mt-1">
                {a.name} • {a.phone}
              </div>
            </div>
          </div>

          <div className="mt-3 text-sm text-slate-700">
            <div className="text-slate-600 mt-1 whitespace-pre-wrap">{a.address}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SecuritySection() {
  return (
    <div className="rounded-2xl border border-gray-300 bg-slate-50 p-5">
      <div className="font-extrabold">Security</div>
      <div className="text-sm text-slate-600 mt-1">
        Password change UI can be added once your backend supports it.
      </div>
      <div className="mt-4 text-xs text-slate-500">
        (Currently demo-only in your original UI. If you want, I’ll add backend endpoint for password change.)
      </div>
    </div>
  );
}

function WishlistSection() {
  return (
    <div className="rounded-2xl border border-gray-300 bg-slate-50 p-10 text-center">
      <div className="text-5xl">❤</div>
      <div className="mt-3 text-xl font-extrabold">Wishlist</div>
      <div className="text-sm text-slate-600 mt-2">Your saved items will appear here.</div>

      <div className="mt-6 flex justify-center gap-3">
        <a href="/" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3">
          Browse Products
        </a>
        <a href="/cart" className="rounded-xl border border-gray-300 bg-white hover:bg-slate-50 font-bold px-6 py-3">
          View Cart
        </a>
      </div>
    </div>
  );
}

function LogoutSection({ onLogout }) {
  return (
    <div className="rounded-2xl border bg-red-50 border-red-100 p-6">
      <div className="font-extrabold text-red-800">Logout</div>
      <div className="text-sm text-red-700 mt-1">You will be signed out from this device.</div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onLogout}
          className="rounded-xl bg-red-700 hover:bg-red-800 text-white font-extrabold px-6 py-3"
        >
          Confirm Logout
        </button>
        <a
          href="/account"
          className="rounded-xl border border-gray-300 bg-white hover:bg-slate-50 font-bold px-6 py-3 text-center"
        >
          Cancel
        </a>
      </div>
    </div>
  );
}

/* -------------------- Small UI helpers -------------------- */

function Avatar({ name, size = "md" }) {
  const initials = (name || "U")
    .split(" ")
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join("");

  const s = size === "lg" ? "h-14 w-14 text-lg rounded-2xl" : "h-11 w-11 text-base rounded-2xl";

  return (
    <div className={`${s} bg-emerald-600 text-white font-extrabold flex items-center justify-center`}>
      {initials}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 bg-white"
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
        rows={3}
        className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 bg-white"
      />
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-slate-600">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cls =
    status === "Delivered"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : status === "Processing"
      ? "bg-amber-50 text-amber-800 border-amber-100"
      : "bg-red-50 text-red-700 border-red-100";

  return <span className={`text-xs font-bold rounded-full border px-2 py-1 ${cls}`}>{status}</span>;
}

function MiniInfo({ icon, title, text }) {
  return (
    <div className="rounded-2xl border bg-white soft-card p-5 flex items-start gap-3 border-gray-300">
      <div className="h-10 w-10 rounded-2xl bg-slate-50 border flex items-center justify-center border-gray-300">
        {icon}
      </div>
      <div>
        <div className="font-extrabold">{title}</div>
        <div className="text-sm text-slate-600 mt-1">{text}</div>
      </div>
    </div>
  );
}

function navHint(key) {
  if (key === "profile") return "Personal info";
  if (key === "orders") return "Track & history";
  if (key === "addresses") return "Saved addresses";
  if (key === "security") return "Password & security";
  if (key === "wishlist") return "Saved products";
  if (key === "logout") return "Sign out safely";
  return "";
}

function sectionSubtitle(active) {
  if (active === "profile") return "Update your personal information and addresses.";
  if (active === "orders") return "View and track your recent orders.";
  if (active === "addresses") return "Addresses saved in your profile.";
  if (active === "security") return "Security settings (add backend endpoint to enable).";
  if (active === "wishlist") return "Your saved products for later purchase.";
  if (active === "logout") return "Sign out from your account.";
  return "";
}