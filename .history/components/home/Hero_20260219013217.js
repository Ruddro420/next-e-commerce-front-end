import HeroSlider from "../ui/HeroSlider";

export default function Hero() {
    return (
        <section className="grid lg:grid-cols-3 gap-5">
            {/* Main hero */}
            <HeroSlider />

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
