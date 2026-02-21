"use client";

import { useState } from "react";
import AuthLayout from "./AuthLayout";
import { apiRequest } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    identifier: "",
    password: "",
    remember: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/api/customer-auth/login", {
        method: "POST",
        body: {
          identifier: form.identifier.trim(),
          password: form.password,
        },
      });

      setToken(data.token);
      window.location.href = "/account";
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Login"
      subtitle="Sign in to your account to manage orders and checkout faster."
      sideTitle="Your orders in one place."
      sideText="Login to track orders, manage addresses, wishlist and get faster support."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <Field label="Phone or Email">
          <input
            value={form.identifier}
            onChange={(e) => setForm((s) => ({ ...s, identifier: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="01XXXXXXXXX or you@email.com"
            required
          />
        </Field>

        <Field label="Password">
          <div className="mt-2 relative">
            <input
              type={show ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 pr-24"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold hover:bg-slate-50"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={form.remember}
              onChange={(e) => setForm((s) => ({ ...s, remember: e.target.checked }))}
            />
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