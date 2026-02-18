"use client";

import { ArrowBigLeftDash, ArrowBigRightDash, SkipForward, SquareArrowOutUpRight } from "lucide-react";
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
        subtitle: "জরুরী প্রয়োজনে: webteam@startechbd.com",
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
        <section className="grid lg:grid-cols-3 gap-5">
            {/* LEFT: Carousel */}
            <div className="lg:col-span-2">
                {/* Fix height ONLY on lg so it matches right column */}
                <div className="relative overflow-hidden rounded-3xl soft-card bg-white h-[260px] sm:h-[300px] lg:h-[320px]">
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
                                <div className="h-full w-full p-6 sm:p-8 lg:p-10 text-white flex flex-col justify-center">
                                    <div className="text-sm opacity-90">{s.badge}</div>

                                    <div className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                                        {s.title}
                                    </div>

                                    <div className="mt-4 text-sm sm:text-base opacity-90">
                                        {s.subtitle}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="absolute left-6 bottom-6 flex gap-2">
                        <button
                            onClick={prev}
                            className="cursor-pointer rounded-full bg-white/15 hover:bg-white/25 transition px-5 py-2.5 text-sm font-semibold border border-white/20 text-white"
                        >
                            <ArrowBigLeftDash />
                        </button>
                        <button
                            onClick={next}
                            className="cursor-pointer rounded-full bg-white/15 hover:bg-white/25 transition px-5 py-2.5 text-sm font-semibold border border-white/20 text-white"
                        >
                            <ArrowBigRightDash />
                        </button>
                    </div>

                    {/* Dots */}
                    <div className="absolute right-6 bottom-6 flex gap-2">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`h-2.5 w-2.5 rounded-full transition ${current === i ? "bg-white" : "bg-white/40 hover:bg-white/70"
                                    }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>

                    {/* Left accent (like your screenshot) */}
                    {/* <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-violet-500 to-emerald-400" /> */}
                </div>
            </div>

            {/* RIGHT: Two equal-height cards */}
            <div className="flex flex-col gap-5 h-[260px] sm:h-[300px] lg:h-[320px]">
                {/* Card 1 */}
                <div className="flex-1 rounded-3xl soft-card overflow-hidden bg-gradient-to-r from-orange-500 to-orange-400 p-5 text-white flex items-center justify-between">
                    <div>
                        <div className="text-xl sm:text-2xl font-extrabold">সব কিছু অ্যাপে…</div>
                        <button className="mt-3 inline-flex rounded-xl bg-white/15 hover:bg-white/20 transition px-4 py-2 font-bold">
                            ডাউনলোড করুন
                        </button>
                    </div>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15" >
                        <SquareArrowOutUpRight /></div>
                </div>

                {/* Card 2 */}
                <div className="flex-1 rounded-3xl soft-card overflow-hidden bg-gradient-to-r from-sky-700 to-sky-500 p-5 text-white flex items-center justify-between">
                    <div>
                        <div className="text-lg sm:text-xl font-extrabold">
                            AC টন নিয়ে সহজ সমাধান!
                        </div>
                        <button className="mt-3 inline-flex rounded-xl bg-white/15 hover:bg-white/20 transition px-4 py-2 font-bold">
                            AC Ton Calculator
                        </button>
                    </div>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15" />
                </div>
            </div>
        </section>
    );
}
