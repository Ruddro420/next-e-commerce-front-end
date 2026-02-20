import ProductDetails from '@/components/product/ProductDetails';
import RelatedProduct from '@/components/product/RelatedProduct';
import Container from '@/components/ui/Container';
import React from 'react';

const page = ({ params }) => {
    return (
        <div>
            <ProductDetails productId={params.productId} />
            <Container className="space-y-10 pt-20">
                <RelatedProduct />
            </Container>
        </div>
    );
};

export default page;