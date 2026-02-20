import CategoryPage from "@/components/category/CategoryPage";

export default function Page({ params }) {
  return <CategoryPage categoryId={params.id} />;
}
