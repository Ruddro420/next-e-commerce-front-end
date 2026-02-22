// app/brand/[slug]/page.jsx
import BrandProductsPage from "@/components/brandproduct/BrandProductsPage";

export default async function Page({ params }) {
  // In Next.js 15+, params might be a Promise
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";
  const decodedSlug = decodeURIComponent(slug);
  
  return <BrandProductsPage slug={decodedSlug} title={decodedSlug} />;
}