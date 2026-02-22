import Header from "@/components/layout/Header";
import CategoryNav from "@/components/layout/CategoryNav";
import Footer from "@/components/layout/Footer";
import FloatingActions from "@/components/layout/FloatingActions";

import Hero from "@/components/home/Hero";
import FeaturedCategory from "@/components/home/FeaturedCategory";
import QuickFeatures from "@/components/home/QuickFeatures";
import FreshDrops from "@/components/home/FreshDrops";

import Container from "@/components/ui/Container";
import ProductDetails from "@/components/product/ProductDetails";
import BrandProductsPage from "@/components/brandproduct/BrandProductsPage";

export default function HomePage() {
  return (
    <>
      {/* <Header />
      <CategoryNav /> */}

      <main className="py-6">
        <Container className="space-y-10">
          <Hero />
          <FeaturedCategory />
          <QuickFeatures />
           <BrandProductsPage slug="popular-products" title="Popular Products" />
          {/* <FreshDrops /> */}
          <BrandProductsPage slug="special-offer" title="Special Offers" />
        </Container>
      </main>

      {/* <ProductDetails/> */}

      {/* <Footer />
      <FloatingActions /> */}
    </>
  );
}
