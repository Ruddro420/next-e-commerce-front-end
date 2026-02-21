"use client";

import { useState } from "react";
import AuthLayout from "./AuthLayout";

export default function SignupPage() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  // Demo only
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Account created ✅ (demo)");
    }, 1000);
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Sign up to track orders, save addresses and checkout faster."
      sideTitle="One account. Full control."
      sideText="Create your account to manage orders, wishlist, addresses and enjoy faster checkout."
    >
      {/* Social signup */}
      {/* <div className="grid sm:grid-cols-2 gap-3">
        <button className="rounded-xl border border-gray-300 bg-white hover:bg-slate-50 font-bold py-3 flex items-center justify-center gap-2">
          <span className="text-lg">G</span> Sign up with Google
        </button>
        <button className="rounded-xl border border-gray-300 bg-white hover:bg-slate-50 font-bold py-3 flex items-center justify-center gap-2">
          <span className="text-lg">f</span> Sign up with Facebook
        </button>
      </div> */}

      {/* <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <div className="text-xs text-slate-500">OR</div>
        <div className="h-px flex-1 bg-slate-200" />
      </div> */}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full Name">
            <input
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Your name"
              required
            />
          </Field>

          <Field label="Phone">
            <input
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="01XXXXXXXXX"
              required
            />
          </Field>
        </div>

        <Field label="Email (Optional)">
          <input
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="you@email.com"
          />
        </Field>

        <Field label="Password">
          <div className="mt-2 relative">
            <input
              type={show ? "text" : "password"}
              className="w-full rounded-xl border  border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 pr-24"
              placeholder="Create a strong password"
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
          <div className="mt-2 text-xs text-slate-500">
            Use 8+ characters with a mix of letters and numbers.
          </div>
        </Field>

        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input type="checkbox" className="mt-1 h-4 w-4" required />
          <span>
            I agree to the <span className="font-semibold">Terms & Conditions</span> and{" "}
            <span className="font-semibold">Privacy Policy</span>.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className={[
            "w-full rounded-xl py-3 font-extrabold text-white",
            loading ? "bg-emerald-300 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700",
          ].join(" ")}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <div className="text-sm text-slate-600 text-center">
          Already have an account?{" "}
          <a href="/login" className="font-extrabold text-emerald-700 hover:underline">
            Login
          </a>
        </div>
      </form>

      {/* OTP verify hint */}
      {/* <div className="mt-6 rounded-2xl border border-gray-300 bg-slate-50 p-4">
        <div className="font-extrabold text-sm">Phone Verification (Recommended)</div>
        <div className="text-xs text-slate-600 mt-1">
          After signup, you can verify phone via OTP to secure your account.
        </div>
      </div> */}
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
