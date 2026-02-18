import Container from "@/components/ui/Container";

export default function AuthLayout({ title, subtitle, children, sideTitle, sideText }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Container className="py-10">
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          {/* Left: Form area */}
          <div className="rounded-3xl border border-gray-300 bg-white soft-card overflow-hidden">
            <div className="px-6 py-5 border-b">
              <div className="text-xs text-slate-500">ShopBangla Account</div>
              <h1 className="text-2xl md:text-3xl font-extrabold mt-1">{title}</h1>
              <p className="text-sm text-slate-600 mt-2">{subtitle}</p>
            </div>

            <div className="p-6">{children}</div>
          </div>

          {/* Right: Branding / Benefits */}
          <div className="rounded-3xl soft-card overflow-hidden bg-gradient-to-br from-emerald-700 to-emerald-500 text-white p-8 hidden lg:flex flex-col justify-between">
            <div>
              <div className="text-sm opacity-90">Welcome to ShopBangla</div>
              <div className="mt-2 text-4xl font-extrabold leading-tight">
                {sideTitle || "Shop smarter, faster, safer."}
              </div>
              <p className="mt-4 text-white/90 leading-relaxed">
                {sideText ||
                  "Track orders, save addresses, and checkout faster with your account."}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <Benefit icon="🚚" title="Fast Delivery" text="Inside Dhaka 24-48h" />
                <Benefit icon="🔒" title="Secure" text="Protected checkout" />
                <Benefit icon="↩️" title="Easy Return" text="Return within 3 days" />
                <Benefit icon="💬" title="Support" text="Call 16793" />
              </div>
            </div>

            <div className="text-xs text-white/80">
              © {new Date().getFullYear()} ShopBangla. All rights reserved.
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

function Benefit({ icon, title, text }) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
      <div className="text-2xl">{icon}</div>
      <div className="mt-2 font-extrabold">{title}</div>
      <div className="text-sm text-white/85 mt-1">{text}</div>
    </div>
  );
}
