"use client";

import { ArrowBigLeftDash, ArrowBigRightDash, SquareArrowOutUpRight } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
    {
        id: 1,
        badge: "স্পেশাল ক্যাম্পেইন",
        title: (
            <>
                ঈদ কালেকশন এখন <span className="text-amber-300">লাইভ</span>
            </>
        ),
        subtitle: "সীমিত সময়ের জন্য",
        gradient: "from-emerald-700 to-emerald-500",
    },
    {
        id: 2,
        badge: "নতুন অফার",
        title: (
            <>
                বিশাল <span className="text-yellow-300">ডিসকাউন্ট</span> চলছে!
            </>
        ),
        subtitle: "আজই অর্ডার করুন এবং অফার নিন",
        gradient: "from-indigo-700 to-violet-600",
    },
    {
        id: 3,
        badge: "নোটিশ",
        title: (
            <>
                আমাদের সকল আউটলেট <span className="text-amber-300">খোলা</span> আছে!
            </>
        ),
        subtitle: "জরুরী প্রয়োজনে: webteam@startechbd.com",
        gradient: "from-sky-700 to-sky-500",
    },
];

export default function HeroSlider() {
    const [current, setCurrent] = useState(0);

    const prev = () => setCurrent((p) => (p === 0 ? slides.length - 1 : p - 1));
    const next = () => setCurrent((p) => (p === slides.length - 1 ? 0 : p + 1));

    useEffect(() => {
        const t = setInterval(() => next(), 5000);
        return () => clearInterval(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <section className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-5">

            {/* LEFT: Carousel — full width on mobile, 2/3 on lg */}
            <div className="lg:col-span-2">
                <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl soft-card bg-white h-[200px] sm:h-[260px] lg:h-[320px]">

                    {/* Slides track */}
                    <div
                        className="flex h-full transition-transform duration-700 ease-in-out"
                        style={{ transform: `translateX(-${current * 100}%)` }}
                    >
                        {slides.map((s) => (
                            <div
                                key={s.id}
                                className={`min-w-full h-full bg-gradient-to-br ${s.gradient}`}
                            >
                                <div className="h-full w-full px-5 py-6 sm:p-8 lg:p-10 text-white flex flex-col justify-center">
                                    <div className="text-xs sm:text-sm opacity-90 font-medium tracking-wide uppercase">
                                        {s.badge}
                                    </div>
                                    <div className="mt-2 text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                                        {s.title}
                                    </div>
                                    <div className="mt-2 sm:mt-4 text-xs sm:text-base opacity-90">
                                        {s.subtitle}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Prev / Next */}
                    <div className="absolute left-3 sm:left-6 bottom-3 sm:bottom-6 flex gap-2">
                        <button
                            onClick={prev}
                            className="cursor-pointer rounded-full bg-white/15 hover:bg-white/30 transition px-3 sm:px-5 py-2 sm:py-2.5 border border-white/20 text-white"
                            aria-label="Previous"
                        >
                            <ArrowBigLeftDash className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                            onClick={next}
                            className="cursor-pointer rounded-full bg-white/15 hover:bg-white/30 transition px-3 sm:px-5 py-2 sm:py-2.5 border border-white/20 text-white"
                            aria-label="Next"
                        >
                            <ArrowBigRightDash className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>

                    {/* Dots */}
                    <div className="absolute right-3 sm:right-6 bottom-4 sm:bottom-7 flex gap-2">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full transition-all ${
                                    current === i ? "bg-white scale-110" : "bg-white/40 hover:bg-white/70"
                                }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT: Two cards — row on mobile, column on lg */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-5 lg:h-[320px]">

                {/* Card 1 */}
                <div className="rounded-2xl lg:rounded-3xl soft-card overflow-hidden bg-gradient-to-r from-orange-500 to-orange-400 p-4 sm:p-5 text-white flex items-center justify-between lg:flex-1">
                    <div className="flex-1 min-w-0">
                        <div className="text-base sm:text-xl lg:text-2xl font-extrabold leading-tight">
                            সব কিছু অ্যাপে…
                        </div>
                        <button className="mt-2 sm:mt-3 inline-flex rounded-xl bg-white/15 hover:bg-white/25 transition px-3 py-1.5 sm:px-4 sm:py-2 font-bold text-xs sm:text-sm whitespace-nowrap">
                            ডাউনলোড করুন
                        </button>
                    </div>
                    <div className="cursor-pointer rounded-xl sm:rounded-2xl bg-white/15 p-4 sm:p-6 lg:p-8 ml-3 flex-shrink-0">
                        <SquareArrowOutUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                </div>

                {/* Card 2 */}
                <div className="rounded-2xl lg:rounded-3xl soft-card overflow-hidden bg-gradient-to-r from-sky-700 to-sky-500 p-4 sm:p-5 text-white flex items-center justify-between lg:flex-1">
                    <div className="flex-1 min-w-0">
                        <div className="text-base sm:text-xl lg:text-xl font-extrabold leading-tight">
                            AC টন নিয়ে সহজ সমাধান!
                        </div>
                        <button className="mt-2 sm:mt-3 inline-flex rounded-xl bg-white/15 hover:bg-white/25 transition px-3 py-1.5 sm:px-4 sm:py-2 font-bold text-xs sm:text-sm whitespace-nowrap">
                            AC Ton Calculator
                        </button>
                    </div>
                    <div className="cursor-pointer rounded-xl sm:rounded-2xl bg-white/15 p-4 sm:p-6 lg:p-8 ml-3 flex-shrink-0">
                        <SquareArrowOutUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                </div>
            </div>
        </section>
    );
}