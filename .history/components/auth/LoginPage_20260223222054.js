"use client";

/* eslint-disable @next/next/no-html-link-for-pages */
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "./AuthLayout";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

function normalizeIdentifier(v) {
  return (v || "").trim();
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = useMemo(() => {
    const n = searchParams.get("next");
    // basic safety: only allow internal paths
    if (!n) return "/account";
    if (!n.startsWith("/")) return "/account";
    return n;
  }, [searchParams]);

  const { customer, loading: authLoading, loginWithToken } = useAuth();

  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    identifier: "",
    password: "",
    remember: true,
  });

  // If already logged in, go to account (or next)
  useEffect(() => {
    if (authLoading) return;
    if (customer) router.replace(nextPath);
  }, [customer, authLoading, router, nextPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      const payload = {
        identifier: normalizeIdentifier(form.identifier),
        password: form.password,
      };

      const data = await apiRequest("/api/customer-auth/login", {
        method: "POST",
        body: payload,
      });

      // ✅ sets token + fetches /me + updates global state
      await loginWithToken(data.token);

      // Redirect to intended page (checkout/account/etc)
      router.replace(nextPath);
    } catch (err) {
      // apiRequest already formats message; just show it
      setError(err?.message || "Login failed");
    } finally {
      setSubmitting(false);
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

        <Field label="Email">
          <input
            value={form.identifier}
            onChange={(e) => setForm((s) => ({ ...s, identifier: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="01XXXXXXXXX or you@email.com"
            required
            autoComplete="username"
            inputMode="text"
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
              autoComplete="current-password"
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
          disabled={submitting}
          className={[
            "w-full rounded-xl py-3 font-extrabold text-white flex items-center justify-center gap-2",
            submitting ? "bg-emerald-300 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700",
          ].join(" ")}
        >
          {submitting ? (
            <>
              <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Signing in...
            </>
          ) : (
            "Login"
          )}
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