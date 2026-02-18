export default function Hero() {
  return (
    <section className="grid lg:grid-cols-3 gap-5">
      {/* Main hero */}
      <div className="lg:col-span-2 rounded-3xl soft-card bg-gradient-to-br from-sky-700 to-sky-500 overflow-hidden min-h-[280px] flex items-center">
        <div className="p-6 md:p-10 text-white w-full">
          <div className="text-sm opacity-90">১৪ ফেব্রুয়ারি, শনিবার</div>

          <div className="mt-2 text-3xl md:text-5xl font-extrabold leading-tight">
            আমাদের সকল আউটলেট
            <br />
            সম্পূর্ণ রূপে <span className="text-amber-300">খোলা আছে!</span>
          </div>

          <div className="mt-5 text-sm opacity-90">
            জরুরী প্রয়োজনে মেইল করুন: webteam@startechbd.com
          </div>

          <div className="mt-6 flex gap-2">
            <button className="rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold border border-white/20">
              Prev
            </button>
            <button className="rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold border border-white/20">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Side promos */}
      <div className="space-y-5">
        <div className="rounded-3xl soft-card overflow-hidden bg-gradient-to-r from-orange-500 to-orange-400 min-h-[132px] p-5 text-white flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold">সব কিছু অ্যাপে…</div>
            <div className="text-sm opacity-90 mt-1">ডাউনলোড করুন</div>
            <div className="mt-3 flex gap-2">
              <span className="rounded-lg bg-black/25 px-3 py-2 text-xs">
                Google Play
              </span>
              <span className="rounded-lg bg-black/25 px-3 py-2 text-xs">
                App Store
              </span>
            </div>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-white/15" />
        </div>

        <div className="rounded-3xl soft-card overflow-hidden bg-gradient-to-r from-sky-700 to-sky-500 min-h-[132px] p-5 text-white flex items-center justify-between">
          <div>
            <div className="text-xl font-extrabold">AC টন নিয়ে সহজ সমাধান!</div>
            <div className="mt-2 inline-flex rounded-xl bg-white/15 px-4 py-2 font-bold">
              AC Ton Calculator
            </div>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-white/15" />
        </div>
      </div>
    </section>
  );
}
