"use client";

import { useState, useEffect } from "react";

const slides = [
  {
    id: 1,
    date: "১৪ ফেব্রুয়ারি, শনিবার",
    title: (
      <>
        আমাদের সকল আউটলেট <br />
        সম্পূর্ণ রূপে <span className="text-amber-300">খোলা আছে!</span>
      </>
    ),
    subtitle: "জরুরী প্রয়োজনে মেইল করুন: webteam@startechbd.com",
    gradient: "from-sky-700 to-sky-500",
  },
  {
    id: 2,
    date: "নতুন অফার",
    title: (
      <>
        বিশাল <span className="text-yellow-300">ডিসকাউন্ট</span> চলছে!
      </>
    ),
    subtitle: "আজই অর্ডার করুন এবং অফার নিন",
    gradient: "from-purple-700 to-indigo-600",
  },
  {
    id: 3,
    date: "স্পেশাল ক্যাম্পেইন",
    title: (
      <>
        ঈদ কালেকশন এখন <span className="text-amber-300">লাইভ</span>
      </>
    ),
    subtitle: "সীমিত সময়ের জন্য",
    gradient: "from-emerald-600 to-teal-500",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  // Auto Slide
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="grid lg:grid-cols-3 gap-5">
      {/* Carousel */}
      <div className="lg:col-span-2 relative overflow-hidden rounded-3xl soft-card ">
        {/* Slides Wrapper */}
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${current * 100}%)`,
          }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className={`min-w-full flex items-center bg-gradient-to-br ${slide.gradient}`}
            >
              <div className="p-6 md:p-10 text-white w-full">
                <div className="text-sm opacity-90">{slide.date}</div>

                <div className="mt-2 text-3xl md:text-5xl font-extrabold leading-tight">
                  {slide.title}
                </div>

                <div className="mt-5 text-sm opacity-90">
                  {slide.subtitle}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Prev / Next Buttons */}
        <div className="absolute bottom-6 left-6 flex gap-2">
          <button
            onClick={prevSlide}
            className="rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold border border-white/20 text-white hover:bg-white/25 transition"
          >
            Prev
          </button>
          <button
            onClick={nextSlide}
            className="rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold border border-white/20 text-white hover:bg-white/25 transition"
          >
            Next
          </button>
        </div>

        {/* Dots */}
        <div className="absolute bottom-6 right-6 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 rounded-full transition ${
                current === index
                  ? "bg-white"
                  : "bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right Side Promo (unchanged) */}
      <div className="space-y-5">
        <div className="rounded-3xl soft-card bg-gradient-to-r from-orange-500 to-orange-400 min-h-[132px] p-5 text-white flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold">সব কিছু অ্যাপে…</div>
            <div className="text-sm opacity-90 mt-1">ডাউনলোড করুন</div>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-white/15" />
        </div>

        <div className="rounded-3xl soft-card bg-gradient-to-r from-sky-700 to-sky-500 min-h-[132px] p-5 text-white flex items-center justify-between">
          <div>
            <div className="text-xl font-extrabold">
              AC টন নিয়ে সহজ সমাধান!
            </div>
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
