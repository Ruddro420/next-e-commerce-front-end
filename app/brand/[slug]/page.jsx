// app/brand/[slug]/page.jsx

import BrandProductsPage from "@/components/brandproduct/BrandProductsPage";

export default function Page({ params }) {
  return <BrandProductsPage slug={params.slug} title={params.slug} />;
}