import Container from "@/components/ui/Container";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <Container className="py-3 flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-600" />
          <div className="leading-tight">
            <div className="font-extrabold text-lg">ShopBangla</div>
            <div className="text-xs text-slate-500">BD • ঢাকা</div>
          </div>
        </div>

        {/* Search (desktop) */}
        <div className="flex-1 hidden md:flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              className="w-full rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="পণ্য সার্চ করুন (যেমন: গাড়ি, ইলিশ, মুড়ি)"
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white">
              খুঁজুন
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-auto">
          <button className="hidden lg:inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm">
            🎁 <span>বিশেষ অফার</span>
          </button>

          <button className="relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-white">
            ❤
            <span className="absolute -top-2 -right-2 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5">
              12
            </span>
          </button>

          <button className="relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-white">
            🛒
            <span className="absolute -top-2 -right-2 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5">
              5
            </span>
          </button>

          <button className="rounded-full bg-emerald-600 text-white px-4 py-2 text-sm font-semibold">
            লগইন / সাইনআপ
          </button>
        </div>
      </Container>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <input
            className="w-full rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Search products..."
          />
          <button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
            Search
          </button>
        </div>
      </div>
    </header>
  );
}
