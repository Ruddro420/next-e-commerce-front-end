/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useMemo, useState } from "react";
import Container from "@/components/ui/Container";

const NAV = [
  { key: "profile", label: "Profile", icon: "👤" },
  { key: "orders", label: "Orders", icon: "📦" },
  { key: "addresses", label: "Addresses", icon: "🏠" },
  { key: "security", label: "Security", icon: "🔒" },
  { key: "wishlist", label: "Wishlist", icon: "❤" },
  { key: "logout", label: "Logout", icon: "🚪" },
];

const demoUser = {
  name: "Ruddro Ali",
  phone: "01XXXXXXXXX",
  email: "aliruddro@gmail.com",
  city: "Dhaka",
  joined: "Jan 2026",
};

const demoOrders = [
  {
    id: "SB-10249",
    date: "18 Feb 2026",
    items: 3,
    total: 2899,
    status: "Delivered",
  },
  {
    id: "SB-10210",
    date: "12 Feb 2026",
    items: 1,
    total: 200,
    status: "Processing",
  },
  {
    id: "SB-10189",
    date: "05 Feb 2026",
    items: 2,
    total: 1599,
    status: "Cancelled",
  },
];

const demoAddresses = [
  {
    id: "a1",
    label: "Home",
    name: "Ruddro Ali",
    phone: "01XXXXXXXXX",
    city: "Dhaka",
    area: "Dhanmondi",
    address: "House 12, Road 6, Block B",
    isDefault: true,
  },
  {
    id: "a2",
    label: "Office",
    name: "Ruddro Ali",
    phone: "01XXXXXXXXX",
    city: "Dhaka",
    area: "Kazi Nazrul Ave",
    address: "Navana Zohura Square, Level 5",
    isDefault: false,
  },
];

function formatBDT(amount) {
  return `৳ ${amount.toLocaleString("en-US")}`;
}

export default function AccountPage() {
  const [active, setActive] = useState("profile");
  const [user, setUser] = useState(demoUser);

  const title = useMemo(() => {
    const found = NAV.find((n) => n.key === active);
    return found ? found.label : "Account";
  }, [active]);

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

          <div className="rounded-2xl border bg-white soft-card px-4 py-3 flex items-center gap-3 w-fit">
            <Avatar name={user.name} />
            <div className="leading-tight">
              <div className="font-extrabold">{user.name}</div>
              <div className="text-xs text-slate-500">Joined {user.joined}</div>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="mt-6 grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Desktop sidebar */}
            <div className="hidden lg:block rounded-2xl border bg-white soft-card overflow-hidden">
              <div className="px-5 py-4 border-b">
                <div className="font-extrabold">Settings</div>
                <div className="text-xs text-slate-500 mt-1">
                  Quick navigation
                </div>
              </div>

              <div className="p-2">
                {NAV.map((n) => (
                  <button
                    key={n.key}
                    onClick={() => setActive(n.key)}
                    className={[
                      "w-full text-left rounded-xl px-4 py-3 flex items-center gap-3 transition",
                      active === n.key
                        ? "bg-emerald-50 border border-emerald-100"
                        : "hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <span className="text-lg">{n.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold">{n.label}</div>
                      <div className="text-xs text-slate-500">
                        {navHint(n.key)}
                      </div>
                    </div>
                    <span className="text-slate-400">›</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile tabs */}
            <div className="lg:hidden rounded-2xl border bg-white soft-card p-2 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {NAV.map((n) => (
                  <button
                    key={n.key}
                    onClick={() => setActive(n.key)}
                    className={[
                      "rounded-full px-4 py-2 text-sm font-semibold border transition whitespace-nowrap",
                      active === n.key
                        ? "bg-emerald-600 text-white border-emerald-600"
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
            <div className="rounded-2xl border bg-white soft-card overflow-hidden">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <div>
                  <div className="font-extrabold">{title}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    {sectionSubtitle(active)}
                  </div>
                </div>

                {/* Top quick action */}
                {active === "orders" ? (
                  <button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-sm">
                    Track Order
                  </button>
                ) : active === "addresses" ? (
                  <button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-sm">
                    + Add Address
                  </button>
                ) : null}
              </div>

              <div className="p-5">
                {active === "profile" && (
                  <ProfileSection user={user} setUser={setUser} />
                )}

                {active === "orders" && <OrdersSection orders={demoOrders} />}

                {active === "addresses" && (
                  <AddressesSection addresses={demoAddresses} />
                )}

                {active === "security" && <SecuritySection />}

                {active === "wishlist" && <WishlistSection />}

                {active === "logout" && <LogoutSection />}
              </div>
            </div>

            {/* Trust strip / Support */}
            <div className="grid md:grid-cols-3 gap-4">
              <MiniInfo icon="📞" title="Support" text="Call 16793 (9AM-8PM)" />
              <MiniInfo
                icon="🚚"
                title="Fast Delivery"
                text="Inside Dhaka 24-48 hours"
              />
              <MiniInfo
                icon="↩️"
                title="Easy Return"
                text="Return within 3 days"
              />
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}

/* -------------------- Sections -------------------- */

function ProfileSection({ user, setUser }) {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Profile card */}
      <div className="lg:col-span-1 rounded-2xl border bg-slate-50 p-5">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} size="lg" />
          <div>
            <div className="font-extrabold">{user.name}</div>
            <div className="text-sm text-slate-600">{user.city}</div>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <InfoLine label="Phone" value={user.phone} />
          <InfoLine label="Email" value={user.email || "-"} />
          <InfoLine label="Joined" value={user.joined} />
        </div>

        <button className="mt-5 w-full rounded-xl bg-slate-900 hover:bg-black text-white font-bold py-3">
          Upload Photo (Demo)
        </button>
      </div>

      {/* Form */}
      <div className="lg:col-span-2">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={user.name}
            onChange={(v) => setUser((p) => ({ ...p, name: v }))}
            placeholder="Full name"
          />
          <Input
            label="Phone"
            value={user.phone}
            onChange={(v) => setUser((p) => ({ ...p, phone: v }))}
            placeholder="01XXXXXXXXX"
          />
          <Input
            label="Email"
            value={user.email}
            onChange={(v) => setUser((p) => ({ ...p, email: v }))}
            placeholder="you@email.com"
          />
          <Input
            label="City"
            value={user.city}
            onChange={(v) => setUser((p) => ({ ...p, city: v }))}
            placeholder="Dhaka"
          />
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3">
            Save Changes
          </button>
          <button className="rounded-xl border bg-white hover:bg-slate-50 font-bold px-6 py-3">
            Cancel
          </button>
        </div>

        <div className="mt-4 text-xs text-slate-500">
          Tip: Keep your phone number correct for order updates.
        </div>
      </div>
    </div>
  );
}

function OrdersSection({ orders }) {
  return (
    <div className="space-y-4">
      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr className="text-left">
              <th className="px-4 py-3 font-extrabold">Order</th>
              <th className="px-4 py-3 font-extrabold">Date</th>
              <th className="px-4 py-3 font-extrabold">Items</th>
              <th className="px-4 py-3 font-extrabold">Total</th>
              <th className="px-4 py-3 font-extrabold">Status</th>
              <th className="px-4 py-3 font-extrabold"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{o.id}</td>
                <td className="px-4 py-3 text-slate-600">{o.date}</td>
                <td className="px-4 py-3">{o.items}</td>
                <td className="px-4 py-3 font-bold">{formatBDT(o.total)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-emerald-700 font-semibold hover:underline">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-2xl border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-extrabold">{o.id}</div>
                <div className="text-xs text-slate-500">{o.date}</div>
              </div>
              <StatusBadge status={o.status} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="text-slate-600">Items</div>
              <div className="font-semibold text-right">{o.items}</div>
              <div className="text-slate-600">Total</div>
              <div className="font-extrabold text-right">{formatBDT(o.total)}</div>
            </div>

            <button className="mt-3 w-full rounded-xl border bg-white hover:bg-slate-50 font-bold py-2.5">
              View Order
            </button>
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

            <button className="text-sm font-semibold text-emerald-700 hover:underline">
              Edit
            </button>
          </div>

          <div className="mt-3 text-sm text-slate-700">
            <div className="font-semibold">
              {a.city}, {a.area}
            </div>
            <div className="text-slate-600 mt-1">{a.address}</div>
          </div>

          <div className="mt-4 flex gap-3">
            <button className="rounded-xl border border-gray-300 bg-white hover:bg-slate-50 font-bold px-4 py-2 text-sm">
              Set Default
            </button>
            <button className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold px-4 py-2 text-sm">
              Delete
            </button>
          </div>
        </div>
      ))}

      {/* Add new card */}
      <button className="rounded-2xl border border-gray-300 border-dashed p-5 text-left hover:bg-slate-50 transition">
        <div className="text-2xl">＋</div>
        <div className="mt-2 font-extrabold">Add new address</div>
        <div className="text-sm text-slate-600 mt-1">
          Save your delivery addresses for faster checkout.
        </div>
      </button>
    </div>
  );
}

function SecuritySection() {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="rounded-2xl border border-gray-300 bg-slate-50 p-5">
        <div className="font-extrabold">Password</div>
        <div className="text-sm text-slate-600 mt-1">
          Change your password regularly to keep your account secure.
        </div>

        <div className="mt-4 space-y-3">
          <Input label="Current Password" value="" onChange={() => {}} placeholder="••••••••" type="password" />
          <Input label="New Password" value="" onChange={() => {}} placeholder="••••••••" type="password" />
          <Input label="Confirm New Password" value="" onChange={() => {}} placeholder="••••••••" type="password" />
        </div>

        <button className="mt-4 w-full rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold py-3">
          Update Password
        </button>
      </div>

      <div className="rounded-2xl border border-gray-300 p-5">
        <div className="font-extrabold">2-Step Verification</div>
        <div className="text-sm text-slate-600 mt-1">
          Add an extra layer of protection (demo UI).
        </div>

        <div className="mt-4 rounded-xl border border-gray-300 bg-white p-4 flex items-center justify-between">
          <div>
            <div className="font-semibold">SMS Verification</div>
            <div className="text-xs text-slate-500 mt-1">Recommended</div>
          </div>
          <button className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-sm">
            Enable
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-gray-300 bg-white p-4 flex items-center justify-between">
          <div>
            <div className="font-semibold">Authenticator App</div>
            <div className="text-xs text-slate-500 mt-1">More secure</div>
          </div>
          <button className="rounded-full border border-gray-300 bg-white hover:bg-slate-50 font-bold px-4 py-2 text-sm">
            Setup
          </button>
        </div>
      </div>
    </div>
  );
}

function WishlistSection() {
  return (
    <div className="rounded-2xl border border-gray-300 bg-slate-50 p-10 text-center">
      <div className="text-5xl">❤</div>
      <div className="mt-3 text-xl font-extrabold">Wishlist</div>
      <div className="text-sm text-slate-600 mt-2">
        Your saved items will appear here.
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <a
          href="/"
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3"
        >
          Browse Products
        </a>
        <a
          href="/cart"
          className="rounded-xl border border-gray-300 bg-white hover:bg-slate-50 font-bold px-6 py-3"
        >
          View Cart
        </a>
      </div>
    </div>
  );
}

function LogoutSection() {
  return (
    <div className="rounded-2xl border bg-red-50 border-red-100 p-6">
      <div className="font-extrabold text-red-800">Logout</div>
      <div className="text-sm text-red-700 mt-1">
        You will be signed out from this device.
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <button className="rounded-xl bg-red-700 hover:bg-red-800 text-white font-extrabold px-6 py-3">
          Confirm Logout
        </button>
        <button className="rounded-xl border border-gray-300 bg-white hover:bg-slate-50 font-bold px-6 py-3">
          Cancel
        </button>
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

  const s =
    size === "lg"
      ? "h-14 w-14 text-lg rounded-2xl"
      : "h-11 w-11 text-base rounded-2xl";

  return (
    <div
      className={`${s} bg-emerald-600 text-white font-extrabold flex items-center justify-center`}
    >
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
        className="mt-2 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 bg-white"
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

  return (
    <span className={`text-xs font-bold rounded-full border px-2 py-1 ${cls}`}>
      {status}
    </span>
  );
}

function MiniInfo({ icon, title, text }) {
  return (
    <div className="rounded-2xl border bg-white soft-card p-5 flex items-start gap-3">
      <div className="h-10 w-10 rounded-2xl bg-slate-50 border flex items-center justify-center">
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
  if (key === "addresses") return "Delivery locations";
  if (key === "security") return "Password & 2FA";
  if (key === "wishlist") return "Saved products";
  if (key === "logout") return "Sign out safely";
  return "";
}

function sectionSubtitle(active) {
  if (active === "profile") return "Update your personal information and contact details.";
  if (active === "orders") return "View and track your recent orders.";
  if (active === "addresses") return "Manage your shipping addresses.";
  if (active === "security") return "Update password and enable extra security.";
  if (active === "wishlist") return "Your saved products for later purchase.";
  if (active === "logout") return "Sign out from your account.";
  return "";
}
