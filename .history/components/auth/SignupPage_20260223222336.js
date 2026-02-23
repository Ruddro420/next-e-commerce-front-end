"use client";

/* eslint-disable @next/next/no-html-link-for-pages */
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "./AuthLayout";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

function normalize(v) {
  return (v || "").trim();
}

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = useMemo(() => {
    const n = searchParams.get("next");
    if (!n) return "/account";
    if (!n.startsWith("/")) return "/account";
    return n;
  }, [searchParams]);

  const { customer, loading: authLoading, loginWithToken } = useAuth();

  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    agree: false,
  });

  // If already logged in, go where you intended
  useEffect(() => {
    if (authLoading) return;
    if (customer) router.replace(nextPath);
  }, [customer, authLoading, router, nextPath]);

  const canSubmit =
    form.agree &&
    normalize(form.name) &&
    normalize(form.phone) &&
    form.password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setError("");
    setSubmitting(true);

    try {
      const payload = {
        name: normalize(form.name),
        phone: normalize(form.phone),
        email: normalize(form.email) || null,
        password: form.password,
      };

      const data = await apiRequest("/api/customer-auth/register", {
        method: "POST",
        body: payload,
      });

      // ✅ sets token + fetches /me + updates global state
      await loginWithToken(data.token);

      router.replace(nextPath);
    } catch (err) {
      setError(err?.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Sign up to track orders, save addresses and checkout faster."
      sideTitle="One account. Full control."
      sideText="Create your account to manage orders, wishlist, addresses and enjoy faster checkout."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full Name">
            <input
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Your name"
              required
              autoComplete="name"
            />
          </Field>

          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="01XXXXXXXXX"
              required
              autoComplete="tel"
              inputMode="tel"
            />
          </Field>
        </div>

        <Field label="Email">
          <input
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="you@email.com"
            required
            autoComplete="email"
            inputMode="email"
          />
        </Field>

        <Field label="Password">
          <div className="mt-2 relative">
            <input
              type={show ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 pr-24"
              placeholder="Create a strong password"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold hover:bg-slate-50"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>

          <div className="mt-2 text-xs text-slate-500">
            Use 8+ characters with a mix of letters and numbers.
          </div>
        </Field>

        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
            checked={form.agree}
            onChange={(e) => setForm((s) => ({ ...s, agree: e.target.checked }))}
            required
          />
          <span>
            I agree to the <span className="font-semibold">Terms & Conditions</span> and{" "}
            <span className="font-semibold">Privacy Policy</span>.
          </span>
        </label>

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className={[
            "w-full rounded-xl py-3 font-extrabold text-white flex items-center justify-center gap-2",
            canSubmit && !submitting
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-emerald-300 cursor-not-allowed",
          ].join(" ")}
        >
          {submitting ? (
            <>
              <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Creating...
            </>
          ) : (
            "Create Account"
          )}
        </button>

        <div className="text-sm text-slate-600 text-center">
          Already have an account?{" "}
          <a href={`/login?next=${encodeURIComponent(nextPath)}`} className="font-extrabold text-emerald-700 hover:underline">
            Login
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