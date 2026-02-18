import { freshDrops } from "@/data/home";

function ProductCard({ item }) {
  return (
    <article className="bg-white rounded-2xl soft-card overflow-hidden">
      <div className="relative p-5 bg-slate-50">
        <button className="absolute right-4 top-4 w-9 h-9 rounded-full bg-white border flex items-center justify-center">
          ❤
        </button>

        <div className="h-44 flex items-center justify-center">
          <div className={`w-24 h-32 rounded-xl ${item.color}`} />
        </div>
      </div>

      <div className="p-4">
        <div className="font-bold leading-snug line-clamp-2">{item.name}</div>
        <div className="text-sm text-slate-500 mt-1">{item.size}</div>
        <div className="mt-2 font-extrabold">{item.price}</div>

        <button className="mt-3 w-full rounded-xl border-2 border-blue-500 text-blue-600 font-bold py-2.5 text-sm hover:bg-blue-50">
          🛒 ADD TO CART
        </button>
      </div>
    </article>
  );
}

export default function FreshDrops() {
  return (
    <section>
      <div className="flex items-center gap-4 mb-5">
        <div className="h-px flex-1 bg-slate-200" />
        <h2 className="text-2xl font-extrabold">Fresh Drops</h2>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {freshDrops.map((p) => (
          <ProductCard key={p.name} item={p} />
        ))}
      </div>

      <div className="flex justify-center mt-7">
        <a
          className="rounded-full border-2 border-blue-500 text-blue-600 font-extrabold px-8 py-3 hover:bg-blue-50 inline-flex items-center gap-2"
          href="#"
        >
          VIEW ALL PRODUCTS <span>→</span>
        </a>
      </div>
    </section>
  );
}
