import { quickFeatures } from "@/data/home";

export default function QuickFeatures() {
  return (
    <section className="grid md:grid-cols-4 gap-4">
      {quickFeatures.map((f) => (
        <a
          key={f.title}
          href="#"
          className="bg-white rounded-2xl soft-card p-5 flex items-center gap-4 hover:-translate-y-0.5 transition"
        >
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-xl">
            {f.icon}
          </div>
          <div>
            <div className="font-extrabold">{f.title}</div>
            <div className="text-sm text-slate-600">{f.sub}</div>
          </div>
        </a>
      ))}
    </section>
  );
}
