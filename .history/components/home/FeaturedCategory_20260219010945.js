import SectionTitle from "@/components/ui/SectionTitle";
import { featuredCategories } from "@/data/home";

export default function FeaturedCategory() {
  return (
    <section>
      <SectionTitle
        title="Featured Category"
        subtitle="Get Your Desired Product from Featured Category!"
      />

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {featuredCategories.map((c) => (
          <a
            key={c.name}
            href="#"
            className="bg-white rounded-2xl soft-card p-4 hover:-translate-y-0.5 transition"
          >
            <div className="text-2xl">{c.icon}</div>
            <div className="mt-2 text-sm font-semibold line-clamp-2">
              {c.name}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
