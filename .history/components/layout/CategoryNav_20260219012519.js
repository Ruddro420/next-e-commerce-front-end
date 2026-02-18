import Container from "@/components/ui/Container";
import { topCategories } from "@/data/home";

export default function CategoryNav() {
  return (
    <nav className="bg-white">
      <Container className="py-2 flex items-center gap-4 overflow-x-auto">
        {topCategories.map((c) => {
          if (c.pill) {
            return (
              <a
                key={c.label}
                href="#"
                className="ml-auto rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-sm font-semibold whitespace-nowrap"
              >
                {c.label}
              </a>
            );
          }

          return (
            <a
              key={c.label}
              href="#"
              className={[
                "whitespace-nowrap text-[16px]",
                c.active
                  ? "font-semibold text-emerald-700"
                  : "text-slate-600 hover:text-slate-900",
              ].join(" ")}
            >
              {c.label}
            </a>
          );
        })}
      </Container>
    </nav>
  );
}
