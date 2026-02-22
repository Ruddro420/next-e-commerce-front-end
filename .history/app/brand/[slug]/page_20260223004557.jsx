// app/brand/[slug]/page.jsx
import BrandProductsPage from "@/components/brandproduct/BrandProductsPage";

export default async function Page({ params }) {
  // params is automatically provided by Next.js
  const slug = params?.slug || "";
  // Decode the slug to handle special characters
  const decodedSlug = decodeURIComponent(slug);
  
  return <BrandProductsPage slug={decodedSlug} title={decodedSlug} />;
}