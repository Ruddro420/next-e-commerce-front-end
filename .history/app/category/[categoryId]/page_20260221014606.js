import CategoryPage from "@/components/category/CategoryPage";

export default async function Page({ params }) {
  const { categoryId } = await params; // ✅ params is Promise in your setup
  return <CategoryPage categoryId={Number(categoryId)} />;
}