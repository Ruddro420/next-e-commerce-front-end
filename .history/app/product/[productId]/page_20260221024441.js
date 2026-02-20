import ProductDetails from "@/components/product/ProductDetails";
import RelatedProduct from "@/components/product/RelatedProduct";
import Container from "@/components/ui/Container";

export default async function Page({ params }) {
  // In your Next version, params can be a Promise
  const resolvedParams = await params;
  const productId = resolvedParams.productId;

  return (
    <div>
      <ProductDetails productId={Number(productId)} />
      <Container className="space-y-10 pt-20">
        <RelatedProduct />
      </Container>
    </div>
  );
}