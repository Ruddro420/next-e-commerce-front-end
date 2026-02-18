import { freshDrops } from "@/data/home";
import { Heart, ShoppingCart } from "lucide-react";

function ProductCard({ item }) {
    return (
        <article className="bg-white rounded-2xl soft-card overflow-hidden">
            <div className="relative p-5 bg-[#FAF8F6]">
                <button className="cursor-pointer absolute right-4 top-4 w-9 h-9 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                    <Heart />
                </button>

                <div className="h-44 flex items-center justify-center">
                    {/* <div className={`w-24 h-32 rounded-xl ${item.color}`} /> */}
                    <div className="">
                        <img src={item.src} alt={item.name} className="h-full object-contain w-50 h-50 rounded-xl" />
                    </div>
                </div>
            </div>

            <div className="p-4">
                <div className="font-bold leading-snug line-clamp-2">{item.name}</div>
                <div className="text-sm text-slate-500 mt-1">{item.size}</div>
                <div className="mt-2 font-extrabold">{item.price}</div>

                <button className="cursor-pointer mt-3 w-full rounded-md border-2 border-[#008159] text-[#008159] font-bold py-2.5 text-sm hover:bg-[#008159] hover:text-white"><ShoppingCart className="inline mr-2 " /> কার্টে যুক্ত করুন 
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
                    className="rounded-full border-2 border-[#008159] text-[#008159] font-extrabold px-8 py-3 hover:bg-[#008159] hover:text-white inline-flex items-center gap-2"
                    href="#"
                >
                    সব প্রোডাক্ট দেখুন  <span>→</span>
                </a>
            </div>
        </section>
    );
}
