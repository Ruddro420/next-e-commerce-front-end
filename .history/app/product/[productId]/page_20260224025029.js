import ProductDetails from "@/components/product/ProductDetails";
import RelatedProduct from "@/components/product/RelatedProduct";
import Container from "@/components/ui/Container";
import ProductReviewsBlock from "@/components/reviews/ProductReviewsBlock";

export default async function Page({ params }) {
  const resolvedParams = await params;
  const productId = resolvedParams.productId;

  return (
    <div>
      <ProductDetails productId={Number(productId)} />

      {/* ✅ Reviews section */}
      <Container className="pt-10">
        <ProductReviewsBlock productId={Number(productId)} />
      </Container>

      <Container className="space-y-10 pt-20">
        <RelatedProduct productId={productId} />
      </Container>
    </div>
  );
}