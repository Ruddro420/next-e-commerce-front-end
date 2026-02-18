"use client";

import { useState } from "react";
import AuthLayout from "./AuthLayout";

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  // Demo only
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Logged in ✅ (demo)");
    }, 900);
  };

  return (
    <AuthLayout
      title="Login"
      subtitle="Sign in to your account to manage orders and checkout faster."
      sideTitle="Your orders in one place."
      sideText="Login to track orders, manage addresses, wishlist and get faster support."
    >
      {/* Social login */}
      <div className="grid sm:grid-cols-2 gap-3">
        <button className="rounded-xl border bg-white hover:bg-slate-50 font-bold py-3 flex items-center justify-center gap-2">
          <span className="text-lg">G</span> Continue with Google
        </button>
        <button className="rounded-xl border bg-white hover:bg-slate-50 font-bold py-3 flex items-center justify-center gap-2">
          <span className="text-lg">f</span> Continue with Facebook
        </button>
      </div>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <div className="text-xs text-slate-500">OR</div>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Phone or Email">
          <input
            className="mt-2 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="01XXXXXXXXX or you@email.com"
            required
          />
        </Field>

        <Field label="Password">
          <div className="mt-2 relative">
            <input
              type={show ? "text" : "password"}
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 pr-24"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border bg-white px-3 py-1.5 text-xs font-bold hover:bg-slate-50"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" className="h-4 w-4" />
            Remember me
          </label>

          <a href="/forgot-password" className="text-sm font-semibold text-emerald-700 hover:underline">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={[
            "w-full rounded-xl py-3 font-extrabold text-white",
            loading ? "bg-emerald-300 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700",
          ].join(" ")}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <div className="text-sm text-slate-600 text-center">
          Don’t have an account?{" "}
          <a href="/signup" className="font-extrabold text-emerald-700 hover:underline">
            Create one
          </a>
        </div>
      </form>

      {/* Extra: OTP quick entry (optional UI) */}
      <div className="mt-6 rounded-2xl border bg-slate-50 p-4">
        <div className="font-extrabold text-sm">Login with OTP (UI demo)</div>
        <div className="text-xs text-slate-600 mt-1">
          You can enable OTP login later using your backend.
        </div>
        <button className="mt-3 w-full rounded-xl border bg-white hover:bg-slate-50 font-bold py-2.5">
          Send OTP
        </button>
      </div>
    </AuthLayout>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      {children}
    </div>
  );
}
