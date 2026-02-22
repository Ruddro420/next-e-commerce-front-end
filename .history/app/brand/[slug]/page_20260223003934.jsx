// app/brand/[slug]/page.jsx
import BrandProductsPage from "@/components/brandproduct/BrandProductsPage";

export default function Page({ params }) {
  const slug = params?.slug ? decodeURIComponent(String(params.slug)) : "";
  return <BrandProductsPage slug={slug} title={slug} />;
}